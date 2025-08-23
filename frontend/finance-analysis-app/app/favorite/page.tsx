"use client";

import { useEffect, useState } from "react";
import { useAPI } from "../(components)/api-context";
import Typeahead from "../(components)/type-ahead";

export default function FavoritePage() {
    const API = useAPI();

    const [favoriteList, setFavoriteList] = useState<string[]>([]);
    const [dataList, setDataList] = useState<string[]>([]);
    const [symbol, setSymbol] = useState("");

    useEffect(() => {
        const fetchFavorite = async () => {
            try {
                const r = await fetch(`${API}/favorite/list`);
                const result = await r.json();
                console.log("Fetched favorite list:", result);
                setFavoriteList(result.favorites || []);
            } catch (e) {
                console.error("Failed to fetch data:", e);
            }
        };
        const fetchData = async () => {
            try {
                const r = await fetch(`${API}/storage/list`);
                const result = await r.json();
                setDataList(result.files || []);
            } catch (e) {
                console.error("Failed to fetch data:", e);
            }
        };

        fetchFavorite();
        fetchData();
    }, []);

    const handleDelete = async (symbol: string) => {
        try {
            const response = await fetch(
                `${API}/favorite/delete?symbol=${symbol}`,
                {
                    method: "POST",
                }
            );
            if (response.ok) {
                setFavoriteList((prev) =>
                    prev.filter((item) => item !== symbol)
                );
            } else {
                console.error("Failed to delete symbol:", symbol);
            }
        } catch (e) {
            console.error("Error while deleting symbol:", e);
        }
    };

    const handleAdd = async () => {
        try {
            const response = await fetch(
                `${API}/favorite/add?symbol=${symbol}`,
                {
                    method: "POST",
                }
            );
            if (response.ok) {
                setFavoriteList((prev) => [...prev, symbol]);
            } else {
                console.error("Failed to add symbol:", symbol);
            }
        } catch (e) {
            console.error("Error while adding symbol:", e);
        }
    };

    return (
        <>
            <div className="h-18"></div>
            <div className="w-full px-30 py-10">
                <h1 className="text-3xl py-5 border-b border-gray-800 dark:border-gray-200">
                    Favorite Tickers
                </h1>
                {favoriteList.map((item) => (
                    <Item key={item} symbol={item} onDelete={handleDelete} />
                ))}
                <div className="flex items-center gap-2 py-5 px-2">
                    Add a ticker:
                    <Typeahead
                        options={dataList}
                        onSelect={(opt) => {
                            setSymbol(opt.value);
                            console.log("Selected:", opt);
                        }}
                        placeholder="Type to search symbols…"
                    />
                    <button
                        onClick={handleAdd}
                        className={`px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600`}
                    >
                        Add
                    </button>
                </div>
                {}
            </div>
        </>
    );
}

function Item({
    symbol,
    onDelete,
}: {
    symbol: string;
    onDelete: (symbol: string) => void;
}) {
    return (
        <div className="w-full border-b border-gray-800 dark:border-gray-200 py-5 flex justify-between px-2">
            <span>{symbol}</span>
            <span
                className="hover:text-red-600 cursor-pointer"
                onClick={() => onDelete(symbol)}
            >
                delete
            </span>
        </div>
    );
}
