# GET information about s3 storage

from fastapi import APIRouter
import pandas as pd
import io
from backend.s3_manager import s3

router = APIRouter(prefix="/storage", tags=["storage"])

def list_files():
    files = s3.list("raw/")
    files = [file[4:-13] for file in files]
    return {"files": files, "count": len(files)}

@router.get("/list")
def list_files_endpoint():
    return list_files()

@router.get("/presign")
def presign_key(key: str):
    return {"url": s3.presign(key)}

@router.get("/data")
def get_data(symbol: str):
    key = f"raw/{symbol}/data.parquet"
    # convert parquet to dataframe
    buf = io.BytesIO(s3.download(key))
    df = pd.read_parquet(buf)
    # convert Date format
    df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")
    table = df.to_dict(orient="records")
    return {"data":table, "symbol":symbol, "count": len(table)}

