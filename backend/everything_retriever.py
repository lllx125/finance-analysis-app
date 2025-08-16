# this file retrieves all the data from all symbols
from concurrent.futures import ThreadPoolExecutor, as_completed
from price_retriever import retrieve
import argparse
import json

# to not expose bucket name, we configure it with command line
def parse_args():
    parser = argparse.ArgumentParser(description="Download all stock history to S3.")
    parser.add_argument("--bucket", required=True, help="Target S3 bucket name.")
    return parser.parse_args()

def main():
    args = parse_args()
    bucket = args.bucket
    symbols = json.load(open("backend/us_listed_symbols.json"))
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(retrieve, sym, bucket): sym for sym in symbols}
        for f in as_completed(futures):
            sym = futures[f]
            try:
                nrows = f.result()
                print(f"{sym}: uploaded {nrows} rows")
            except Exception as e:
                print(f"{sym}: FAILED → {e}")
            
if __name__ == "__main__":
    main()
    