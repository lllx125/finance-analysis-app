# this file wraps functions to manage files in s3
from http.client import HTTPException
import os
import boto3
 
BUCKET = os.environ.get("PRICES_BUCKET", "YOUR_BUCKET_NAME")

class S3Manager:
    def __init__(self, bucket_name=BUCKET):
        self.s3 = boto3.client("s3")
        self.bucket = bucket_name

    # upload `body` to `key`
    def upload(self, key, body):
        self.s3.put_object(Bucket=self.bucket, Key=key, Body=body)
        print(f"Uploaded s3://{self.bucket}/{key}")

    # download `key`
    def download(self, key):
        self.exists(key)
        response = self.s3.get_object(Bucket=self.bucket, Key=key)
        print(f"Downloaded s3://{self.bucket}/{key}")
        return response["Body"].read()

    # lists all files under `prefix`
    def list(self, prefix):
        response = self.s3.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
        print(f"Listed s3://{self.bucket}/{prefix}")
        return [obj["Key"] for obj in response.get("Contents", [])]

    # delete `key`
    def delete(self, key):
        self.exists(key)
        self.s3.delete_object(Bucket=self.bucket, Key=key)
        print(f"Deleted s3://{self.bucket}/{key}")

    # check if 'key' exists
    def exists(self, key):
        try:
            self.s3.head_object(Bucket=self.bucket, Key=key)
        except Exception:
            raise ValueError(f"Key {key} does not exist in bucket {self.bucket}")

    # presign url
    def presign(self, key):
        try:
            url = self.s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=900,  # 15 minutes
            )
            print(f"Generated presigned URL for {key}: {url}")
            return url
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


# Create an instance of S3Manager
s3 = S3Manager()