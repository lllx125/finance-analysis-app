# This file retrieves all price data of a single ticker from yfinance
# and stores it in a parquet file

import io
import pandas as pd
import yfinance as yf
from s3_manager import s3

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
