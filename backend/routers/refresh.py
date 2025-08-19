from fastapi import APIRouter
import json
import random
from backend.price_retriever import retrieve_with_retry
from backend.routers.storage import list_files
from backend.routers.favorite import get_favorites_list

router = APIRouter(prefix="/refresh", tags=["refresh"])

@router.post("")
async def refresh_all_favorites():
    """Update all favorite symbols by re-downloading their data"""
    favorites = get_favorites_list()
    result = await retrieve_with_retry(favorites)
    return result

@router.post("/all")
async def refresh_unloaded_stocks():
    """Retrieve 50 unloaded stock symbols from us_listed_symbols.json"""
    
    # Load all available symbols
    with open('backend/us_listed_symbols.json', 'r') as f:
        all_symbols = json.load(f)
    
    # Get currently loaded symbols
    loaded_result = list_files()
    loaded_symbols = set(loaded_result['files'])
    
    # Find unloaded symbols
    unloaded_symbols = [symbol for symbol in all_symbols if symbol not in loaded_symbols]
    
    if not unloaded_symbols:
        return {"message": "All symbols are already loaded", "total": 0}
    
    # Select 50 random unloaded symbols
    symbols_to_load = random.sample(unloaded_symbols, min(50, len(unloaded_symbols)))
    
    # Retrieve with retry
    result = await retrieve_with_retry(symbols_to_load)
    
    return {
        "message": f"Attempted to load {len(symbols_to_load)} unloaded symbols",
        "total_available_symbols": len(all_symbols),
        "total_loaded_symbols": len(loaded_symbols),
        "total_unloaded_symbols": len(unloaded_symbols),
        "attempted_symbols": symbols_to_load,
        "results": result
    }