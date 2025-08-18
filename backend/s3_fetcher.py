# Small API to: list symbols, list files for a symbol, and presign S3 downloads.

import io
from fastapi import FastAPI
import pandas as pd
from s3_manager import s3

# setup fast api object
app = FastAPI(title="Finance Analysis API")

@app.get("/api/health")
def health():
    return {"ok": True}

@app.get("/api/symbols")
def list_symbols():
    return {"symbols": s3.list("raw/")}

@app.get("/api/presign")
def presign_key(key: str):
    return {"url": s3.presign(key)}

@app.get("/api/data")
def get_data(symbol: str):
    key = f"raw/{symbol}/data.parquet"
    # convert parquet to dataframe
    buf = io.BytesIO(s3.download(key))
    df = pd.read_parquet(buf)
    # convert Date format
    df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")
    table = df.to_dict(orient="records")
    return {"symbol":symbol, "length": len(table), "data":table}