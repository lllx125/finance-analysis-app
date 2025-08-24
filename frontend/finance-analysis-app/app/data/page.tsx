"use client";

import { useEffect, useState } from "react";
import Typeahead from "../(components)/type-ahead";
import { Ticker } from "../(components)/ticker";
import { getTicker, getTickerList } from "../(components)/handle-api";
import { useAPI } from "../(components)/api-context";
import { TickerChart } from "../(components)/line-shart";

export default function DataPage() {
    const API = useAPI();
    const [symbol, setSymbol] = useState("AAPL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [data, setData] = useState<Ticker["data"]>([]);
    const [dataList, setDataList] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getTickerList(API);
                setDataList(result);
            } catch (e) {
                console.error("Failed to fetch data:", e);
            }
        };
        fetchData();
    }, []);

    async function load() {
        console.log("Loading data for symbol:", symbol);
        setError("");
        setData([]);
        setLoading(true);
        try {
            const result = await getTicker(symbol, API);
            console.log("Loaded data:", result.data);
            setData(result.data);
        } catch (e: any) {
            setError(e?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="h-18"></div>
            <div className="max-w-4xl mx-auto my-8 px-4">
                <h1 className="text-2xl font-bold mb-6">Price Data</h1>

                <div className="flex gap-2 items-center mb-3">
                    <label className="flex items-center">
                        <span className="mr-2">Symbol:</span>
                        <Typeahead
                            options={dataList}
                            onSelect={(opt) => {
                                setSymbol(opt.value);
                                console.log("Selected:", opt);
                            }}
                            placeholder="Type to search symbols…"
                        />
                    </label>
                    <button
                        onClick={load}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-white ${
                            loading
                                ? "bg-gray-400"
                                : "bg-blue-500 hover:bg-blue-600"
                        }`}
                    >
                        {loading ? "Loading…" : "Load"}
                    </button>
                </div>

                {error && (
                    <div className="text-red-600 mb-3">Error: {error}</div>
                )}

                {!error && data.length > 0 && (
                    <>
                        <div className="mb-2">
                            Showing {data.length.toLocaleString()} data for{" "}
                            <strong>{symbol}</strong>
                        </div>
                        <TickerChart symbol={symbol} />
                    </>
                )}

                {!error && !loading && data.length === 0 && (
                    <p className="text-gray-600">
                        No data loaded yet. Enter a symbol and press Load.
                    </p>
                )}
            </div>
        </>
    );
}
