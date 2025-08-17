import yfinance as yf
import pandas as pd
import json

#yf.Ticker('QQQ').history(period='2mo').to_parquet("data.parquet")
#symbols = json.load(open("us_listed_symbols.json"))
#df1 = yf.Ticker('QQQ').history(period='max')
#df1 = df1.reset_index()
#df1.to_parquet("data.parquet")
df2 = pd.read_parquet("data.parquet")
print(df2)
