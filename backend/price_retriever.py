# This file retrieves all price data of a single ticker from yfinance
# and stores it in a parquet file

import io
import asyncio
from typing import List, Dict
import pandas as pd
import yfinance as yf
from backend.s3_manager import s3
from typing import Any, Dict, List

def fetch_history(symbol: str) -> pd.DataFrame:
    """
    Download historical market data for a single ticker.
    Reformat the DataFrame and return it
    """
    df = yf.Ticker(symbol).history(period="max")
    if df is None or df.empty:
        raise ValueError(f"No data for {symbol}")
   
    df = df.reset_index()
    df1 = pd.DataFrame()
    df1["Price"] = (df["High"]+df["Low"])/2
    df1["Date"] = pd.to_datetime(df["Date"])
    return df1

def dataframe_to_parquet_bytes(df: pd.DataFrame) -> bytes:
    """
    Convert a DataFrame to Parquet in memory (bytes) using PyArrow.
    """
    out = df.copy()
    buf = io.BytesIO()
    out.to_parquet(buf, engine="pyarrow", index=False)
    return buf.getvalue()

def upload_parquet_to_s3(parquet_bytes: bytes, key: str):
    """
    Upload Parquet bytes to S3.
    """
    s3.upload(key, parquet_bytes)

def retrieve(symbol: str):
    key = f"raw/{symbol}/data.parquet"
    df = fetch_history(symbol)
    parquet_bytes = dataframe_to_parquet_bytes(df)
    upload_parquet_to_s3(parquet_bytes, key)

async def retrieve_with_retry_single(
    symbol: str,
    n: int,
    semaphore: asyncio.Semaphore,
    delay_seconds: float = 10.0,
) -> Dict[str, Any]:
    """
    Retrieve single symbol data with async retry mechanism.
    Returns dict with symbol, status, attempts, and optionally data/error.
    """

    for attempt in range(1, n + 1):
        try:
            # Limit concurrency only during the actual work
            async with semaphore:
                data = await asyncio.to_thread(retrieve, symbol)

            return {
                "symbol": symbol,
                "status": "success",
                "attempts": attempt,
                "data": data,  # remove if you don't need the payload
            }
        except Exception as e:
            if attempt == n:
                return {
                    "symbol": symbol,
                    "status": "failed",
                    "error": str(e),
                    "attempts": attempt,
                }
            # log and back off without holding the semaphore
            print(f"Attempt {attempt} failed for {symbol}: {e}. Retrying in {int(delay_seconds)} seconds...")
            await asyncio.sleep(delay_seconds)

async def retrieve_with_retry(
    symbols: List[str],
    n: int = 3,
    max_workers: int = 5,
    delay_seconds: float = 10.0,
) -> Dict[str, Any]:
    """
    Retrieve multiple symbols with parallel async retry mechanism.
    """
    if not symbols:
        return {"message": "No symbols to retrieve", "results": []}

    semaphore = asyncio.Semaphore(max_workers)

    tasks = [
        asyncio.create_task(
            retrieve_with_retry_single(s, n, semaphore, delay_seconds=delay_seconds)
        )
        for s in symbols
    ]

    # Let unexpected programmer errors actually raise
    results = await asyncio.gather(*tasks, return_exceptions=False)

    successful = [r for r in results if r.get("status") == "success"]
    failed = [r for r in results if r.get("status") == "failed"]

    return {
        "total": len(symbols),
        "successful": len(successful),
        "failed": len(failed),
        "results": results,
        "summary": {
            "success_symbols": [r["symbol"] for r in successful],
            "failed_symbols": [f"{r['symbol']},{r['error']}" for r in failed],
        },
    }