import yfinance as yf
import pandas as pd
import json

#yf.Ticker('QQQ').history(period='2mo').to_parquet("data.parquet")
#symbols = json.load(open("backend/us_listed_symbols.json"))
#df1 = yf.Ticker('QQQ').history(period='max')
#df1 = df1.reset_index()
#df1.to_parquet("data.parquet")
df2 = pd.read_parquet("data.parquet")

df3 = pd.DataFrame()
df3["price"] = (df2["High"]+df2["Low"])/2
df3["Date"] = pd.to_datetime(df2["Date"])
df3["Symbol"] = "QQQ"
print(df3["Date"][1].year)