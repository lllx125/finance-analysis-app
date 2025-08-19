from fastapi import APIRouter, HTTPException
import json
from backend.s3_manager import s3
from backend.price_retriever import retrieve

router = APIRouter(prefix="/favorite", tags=["favorite"])

FAVORITES_KEY = "symbols/favorite.json"

def get_favorites_list():
    """Helper function to get current favorites from S3"""
    try:
        data = s3.download(FAVORITES_KEY)
        return json.loads(data.decode('utf-8'))
    except:
        return []

def save_favorites_list(favorites):
    """Helper function to save favorites list to S3"""
    data = json.dumps(favorites).encode('utf-8')
    s3.upload(FAVORITES_KEY, data)

@router.get("/list")
def list_favorites():
    """List all elements in favorite.json"""
    favorites = get_favorites_list()
    return {"favorites": favorites, "length": len(favorites)}

@router.post("/add")
def add_favorite(symbol: str):
    """Add a symbol to favorites and download data if not exists"""
    symbol = symbol.upper()
    
    # Get current favorites
    favorites = get_favorites_list()
    
    # Check if already in favorites
    if symbol in favorites:
        return {"message": f"{symbol} already in favorites", "favorites": favorites}
    
    # Check if symbol data exists in S3
    try:
        files = s3.list("raw/")
        symbol_exists = any(f"raw/{symbol}/" in file for file in files)
        
        if not symbol_exists:
            # Download the symbol data
            retrieve(symbol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download {symbol}: {str(e)}")
    
    # Add to favorites
    favorites.append(symbol)
    save_favorites_list(favorites)
    
    return {"message": f"{symbol} added to favorites", "favorites": favorites}

@router.delete("/delete")
def delete_favorite(symbol: str):
    """Delete a symbol from favorites list"""
    symbol = symbol.upper()
    
    # Get current favorites
    favorites = get_favorites_list()
    
    # Check if symbol exists in favorites
    if symbol not in favorites:
        raise HTTPException(status_code=404, detail=f"{symbol} not found in favorites")
    
    # Remove from favorites
    favorites.remove(symbol)
    save_favorites_list(favorites)
    
    return {"message": f"{symbol} removed from favorites", "favorites": favorites}