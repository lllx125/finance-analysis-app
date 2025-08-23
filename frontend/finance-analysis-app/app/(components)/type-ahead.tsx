"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type Option = { value: string; label: string } | string;

function toOpt(o: Option) {
    return typeof o === "string" ? { value: o, label: o } : o;
}

export default function Typeahead({
    options,
    onSelect,
    placeholder = "Search…",
    className = "",
    maxVisible = Infinity, // set to a number if you want to limit count
}: {
    options: Option[];
    onSelect: (opt: { value: string; label: string }) => void;
    placeholder?: string;
    className?: string;
    maxVisible?: number;
}) {
    const all = useMemo(() => options.map(toOpt), [options]);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);

    const listboxId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const arr = q
            ? all.filter((o) => o.label.toLowerCase().includes(q))
            : all;
        return Number.isFinite(maxVisible)
            ? arr.slice(0, maxVisible as number)
            : arr;
    }, [all, query, maxVisible]);

    // Close on outside click
    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
                setActive(-1);
            }
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    // Keep the active option visible when navigating
    useEffect(() => {
        if (!listRef.current || active < 0) return;
        const el = listRef.current.querySelector<HTMLElement>(
            `[data-idx="${active}"]`
        );
        el?.scrollIntoView({ block: "nearest" });
    }, [active]);

    function choose(i: number) {
        const opt = filtered[i];
        if (!opt) return;
        onSelect(opt);
        setQuery(opt.label);
        setOpen(false);
        setActive(-1);
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            if (open && active >= 0) {
                e.preventDefault();
                choose(active);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
            setActive(-1);
        }
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <input
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setActive(0);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                aria-controls={listboxId}
                aria-expanded={open}
                aria-autocomplete="list"
                className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm
                   bg-white dark:bg-gray-900 dark:border-gray-800
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {open && (
                <ul
                    id={listboxId}
                    role="listbox"
                    ref={listRef}
                    className="absolute z-50 mt-2 w-full max-h-60 overflow-auto
                     rounded-xl border bg-white shadow-lg
                     dark:bg-gray-900 dark:border-gray-800"
                >
                    {filtered.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No matches
                        </li>
                    ) : (
                        filtered.map((opt, i) => {
                            const isActive = i === active;
                            return (
                                <li
                                    key={opt.value}
                                    data-idx={i}
                                    role="option"
                                    aria-selected={isActive}
                                    onMouseEnter={() => setActive(i)}
                                    onMouseDown={(e) => e.preventDefault()} // keep focus on input
                                    onClick={() => choose(i)}
                                    className={`cursor-pointer px-3 py-2 text-sm flex items-center
                    ${
                        isActive
                            ? "bg-blue-50 dark:bg-blue-950"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    }`}
                                >
                                    <Highlight text={opt.label} query={query} />
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
}

function Highlight({ text, query }: { text: string; query: string }) {
    if (!query) return <>{text}</>;
    const q = query.trim();
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, i)}
            <mark className="rounded-sm bg-yellow-200/60">
                {text.slice(i, i + q.length)}
            </mark>
            {text.slice(i + q.length)}
        </>
    );
}
