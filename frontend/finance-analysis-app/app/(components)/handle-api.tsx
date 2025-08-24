import { Ticker } from "./ticker";

export async function getTicker(
    symbol: string,
    api: string = "/api"
): Promise<Ticker> {
    const response = await fetch(`${api}/storage/data?symbol=${symbol}`);
    if (!response.ok) {
        throw new Error("Failed to fetch ticker");
    }
    const data = await response.json();
    console.log(data);
    const ticker: Ticker = {
        symbol: data.symbol,
        data: data.data.map((item: any) => {
            return {
                Date: new Date(item.Date),
                Price: item.Price,
            };
        }),
    };
    console.log("Fetched ticker:", ticker);
    return ticker;
}

export async function getTickerList(api: string = "/api"): Promise<string[]> {
    const response = await fetch(`${api}/storage/list`);
    if (!response.ok) {
        throw new Error("Failed to fetch ticker list");
    }
    const data = await response.json();
    const list = data.files || [];
    if (!Array.isArray(list)) {
        throw new Error("Invalid ticker list format");
    } else if (list.length === 0) {
        throw new Error("Ticker list is empty");
    }
    console.log("Fetched ticker list:", list);
    return list;
}
