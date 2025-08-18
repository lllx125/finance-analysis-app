'use client';

import { useState } from 'react';

type RowsResp = {
  symbol: string;
  count: number;
  rows: {
    Date?: string;
    Price?: number | null;
  }[];
};

export default function DataPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [rows, setRows] = useState<RowsResp['rows']>([]);

  async function load() {
    setError('');
    setRows([]);
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE || '/api';
      const r = await fetch(`${API}/data?symbol=${encodeURIComponent(symbol)}`);
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.detail || `Failed: ${r.status}`);
      }
      const j: RowsResp = await r.json();
      setRows(j.rows || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto my-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Price Data</h1>

      <div className="flex gap-2 items-center mb-3">
        <label className="flex items-center">
          <span className="mr-2">Symbol:</span>
          <input
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g. AAPL"
            className="border border-gray-300 rounded px-2 py-1 w-36"
          />
        </label>
        <button
          onClick={load}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </div>

      {error && (
        <div className="text-red-600 mb-3">
          Error: {error}
        </div>
      )}

      {!error && rows.length > 0 && (
        <>
          <div className="mb-2">
            Showing {rows.length.toLocaleString()} rows for <strong>{symbol}</strong>
          </div>

          <div className="overflow-auto max-h-96 border border-gray-200 rounded">
            <table className="table-auto w-full text-sm">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 border-b border-gray-300">Date</th>
                  <th className="text-left px-3 py-2 border-b border-gray-300">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">{r.Date ?? ''}</td>
                    <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">{r.Price ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!error && !loading && rows.length === 0 && (
        <p className="text-gray-600">No data loaded yet. Enter a symbol and press Load.</p>
      )}
    </main>
  );
}
