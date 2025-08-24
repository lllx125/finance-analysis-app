// app/page.tsx (or any client component)
"use client";

import { useEffect, useState } from "react";
import { TickerChart } from "../(components)/line-shart";
import { useAPI } from "../(components)/api-context";
import { getTicker } from "../(components)/handle-api";
import { Ticker } from "../(components)/ticker";

export default function Page() {
    return (
        <main className="p-6">
            <div className="h-18"></div>
            <TickerChart symbol="AAPL" />
        </main>
    );
}
