"use client";

import React, { useEffect, useState } from "react";
import {
    LineChart as RLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { DailyData } from "./ticker";
import { useAPI } from "./api-context";
import { getTicker } from "./handle-api";

interface Props {
    data: DailyData[];
    height?: number;
    yTickCount?: number;
    xTickCount?: number;
    xLabel?: string;
    yLabel?: string;
}

type Datum = { x: string | number; y: number };

function toSeries(data: DailyData[]): Datum[] {
    return data.map((item) => ({
        x: item.Date.toISOString().split("T")[0],
        y: item.Price,
    }));
}

export function LineChart({
    data,
    height = 280,
    yTickCount = 5,
    xTickCount = 6,
    xLabel = "Date",
    yLabel = "Price",
}: Props) {
    const series = React.useMemo(() => toSeries(data), [data]);
    return (
        <div
            className="h-[var(--chart-h)]"
            style={{ ["--chart-h" as any]: `${height}px` }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <RLineChart
                    data={series}
                    margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="x"
                        tickMargin={8}
                        tick={{ fill: "#6b7280" }}
                        label={
                            xLabel
                                ? {
                                      value: xLabel,
                                      position: "insideBottom",
                                      offset: -15,
                                      fill: "#6b7280",
                                  }
                                : undefined
                        }
                    />
                    <YAxis
                        tickCount={yTickCount}
                        domain={[
                            (dataMin) => Math.floor(dataMin),
                            (dataMax) => Math.ceil(dataMax),
                        ]}
                        tick={{ fill: "#6b7280" }}
                        label={
                            yLabel
                                ? {
                                      value: yLabel,
                                      angle: -90,
                                      position: "insideLeft",
                                      fill: "#6b7280",
                                  }
                                : undefined
                        }
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                        }}
                        labelStyle={{ color: "#111827" }}
                        formatter={(value: number) => [
                            value.toFixed(2),
                            "Price",
                        ]}
                    />
                    <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#2563eb" // Tailwind blue-600
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 2 }}
                    />
                </RLineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TickerChart({ symbol }: { symbol: string }) {
    const API = useAPI();
    const [data, setdata] = useState<DailyData[]>([]);
    const [showData, setShowData] = useState<DailyData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getTicker(symbol, API);
                setdata(response.data);
                setShowData(response.data);
            } catch (e: any) {
                setShowData([]);
                setError(e?.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const setRange = (time: number) => {
        setError(null);
        const militime = time * 1000 * 60 * 60 * 24;
        const start = data[0].Date.getTime();
        const end = data[data.length - 1].Date.getTime();
        if (end - start < militime) {
            setError("Selected range is too large");
            setShowData([]);
            return;
        }
        setShowData(
            data.filter(
                (dailyPrice) => dailyPrice.Date >= new Date(end - militime)
            )
        );
    };

    return (
        <>
            {loading ? (
                <div className="h-[280px] w-full items-center justify-center flex text-2xl">
                    Loading...
                </div>
            ) : (
                <>
                    <div className="w-full p-4">
                        {error ? (
                            <div className="h-[280px] w-full items-center justify-center flex text-2xl text-red-600">
                                {error}
                            </div>
                        ) : (
                            <>
                                <div className="mb-3 flex items-center w-full justify-center">
                                    <h3 className="text-3xl">{symbol}</h3>
                                </div>
                                <LineChart data={showData} />
                            </>
                        )}
                        <div className="w-full flex justify-center my-5">
                            <div className="flex justify-between gap-3 items-center">
                                <Button
                                    text="1w"
                                    onClick={() => {
                                        setRange(7);
                                    }}
                                />
                                <Button
                                    text="1m"
                                    onClick={() => {
                                        setRange(30);
                                    }}
                                />
                                <Button
                                    text="2m"
                                    onClick={() => {
                                        setRange(60);
                                    }}
                                />
                                <Button
                                    text="1y"
                                    onClick={() => {
                                        setRange(365);
                                    }}
                                />
                                <Button
                                    text="5y"
                                    onClick={() => {
                                        setRange(5 * 365);
                                    }}
                                />
                                <Button
                                    text="all"
                                    onClick={() => {
                                        setShowData(data);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function Button({ text, onClick }: { text: string; onClick: () => void }) {
    return (
        <button
            className="px-10 py-2 bg-gray-500 hover:bg-indigo-600 text-white rounded"
            onClick={onClick}
        >
            {text}
        </button>
    );
}
