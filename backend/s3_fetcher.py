# Small API to: list symbols, list files for a symbol, and presign S3 downloads.

from fastapi import FastAPI
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
