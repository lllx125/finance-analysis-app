# this file wraps functions to manage files in s3
from http.client import HTTPException
import os
import boto3
 
BUCKET = os.environ.get("PRICES_BUCKET", "YOUR_BUCKET_NAME")

s3 = boto3.client("s3")

# upload `body` to `key`
def upload(key, body):
    s3.put_object(Bucket=BUCKET, Key=key, Body=body)
    print(f"Uploaded s3://{BUCKET}/{key}")

# download `key`
def download(key):
    exists(key)
    response = s3.get_object(Bucket=BUCKET, Key=key)
    print(f"Downloaded s3://{BUCKET}/{key}")
    return response["Body"].read()

# lists all files under `prefix`
def list(prefix):
    response = s3.list_objects_v2(Bucket=BUCKET, Prefix=prefix)
    print(f"Listed s3://{BUCKET}/{prefix}")
    return [obj["Key"] for obj in response.get("Contents", [])]

# delete `key`
def delete(key):
    exists(key)
    s3.delete_object(Bucket=BUCKET, Key=key)
    print(f"Deleted s3://{BUCKET}/{key}")

# check if 'key' exists
def exists(key):
    try:
        s3.head_object(Bucket=BUCKET, Key=key)
    except Exception:
        raise ValueError(f"Key {key} does not exist in bucket {BUCKET}")

# presign url
def presign(key):
    try:
        url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": BUCKET, "Key": key},
            ExpiresIn=900,  # 15 minutes
        )
        print(f"Generated presigned URL for {key}: {url}")
        return url
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))