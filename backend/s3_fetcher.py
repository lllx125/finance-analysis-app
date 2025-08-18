# Small API to: list symbols, list files for a symbol, and presign S3 downloads.

import io
from fastapi import FastAPI
import pandas as pd
from s3_manager import s3
from fastapi.middleware.cors import CORSMiddleware

# setup fast api object
app = FastAPI(title="Finance Analysis API")

# allow your local dev origins
origins = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # exact origins to allow
    allow_credentials=False,    # set True only if you use cookies/auth
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

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