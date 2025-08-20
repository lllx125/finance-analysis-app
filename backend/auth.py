import os
from fastapi import Header, HTTPException, status

def verify_api_key(
    x_api_key: str | None = Header(default=None),
):
    """
    Accept:
      - X-Api-Key: <token>
    Token is read from env: API_TOKEN 
    """
    token = os.environ.get("API_TOKEN") or ""
    if not token:
        # Server misconfigured—no token set
        raise HTTPException(status_code=500, detail="API token not configured")

    if x_api_key and x_api_key == token:
        return True

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")
