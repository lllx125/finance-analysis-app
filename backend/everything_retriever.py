# this file retrieves all the data from all symbols
from concurrent.futures import ThreadPoolExecutor, as_completed
from price_retriever import retrieve
import json


def main():
    #symbols = json.load(open("backend/us_listed_symbols.json"))
    symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]  # Example symbols, replace with your list
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(retrieve, sym): sym for sym in symbols}
        for f in as_completed(futures):
            sym = futures[f]
            try:
                nrows = f.result()
                print(f"{sym}: uploaded")
            except Exception as e:
                print(f"{sym}: FAILED → {e}")
            
if __name__ == "__main__":
    main()
    