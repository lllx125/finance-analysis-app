# sets api structure

from fastapi import FastAPI
from .routers import health, storage, favorite, refresh
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


# Mount routers under a common /api prefix via Nginx/CloudFront behavior
app.include_router(health.router, prefix="/api")
app.include_router(storage.router, prefix="/api")
app.include_router(favorite.router, prefix="/api")
app.include_router(refresh.router, prefix="/api")
