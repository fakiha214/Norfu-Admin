"use client";

import { useState } from "react";

type Row = { size: string; stock: number };

const PRESETS: { label: string; sizes: string[] }[] = [
  { label: "Letters (XS–XXL)", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Jeans (28–36)", sizes: ["28", "30", "32", "34", "36"] },
  { label: "Kids (6–13Y)", sizes: ["6-7Y", "8-9Y", "10-11Y", "12-13Y"] },
];

// Renders editable size/stock rows; submits via a hidden input using
// the same "SIZE | STOCK" line format the server action already parses.
export default function SizeStockEditor({
  name,
  defaultRows,
}: {
  name: string;
  defaultRows: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(
    defaultRows.length > 0 ? defaultRows : []
  );

  const serialized = rows
    .filter((r) => r.size.trim())
    .map((r) => `${r.size.trim()} | ${Math.max(0, r.stock)}`)
    .join("\n");

  const update = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const addRow = (size = "") =>
    setRows((prev) =>
      size && prev.some((r) => r.size.trim().toUpperCase() === size.toUpperCase())
        ? prev
        : [...prev, { size, stock: 0 }]
    );

  const applyPreset = (sizes: string[]) =>
    setRows((prev) => {
      const existing = new Set(prev.map((r) => r.size.trim().toUpperCase()));
      const additions = sizes
        .filter((s) => !existing.has(s.toUpperCase()))
        .map((s) => ({ size: s, stock: 0 }));
      return [...prev, ...additions];
    });

  return (
    <div>
      <input type="hidden" name={name} value={serialized} />

      <div className="space-y-2">
        {rows.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-400">
            No sizes yet — add rows below or start from a preset.
          </p>
        )}
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={row.size}
              onChange={(e) => update(i, { size: e.target.value })}
              placeholder="Size (e.g. M)"
              className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
            <div className="flex items-center rounded-lg border border-slate-300">
              <button
                type="button"
                aria-label="Decrease stock"
                onClick={() => update(i, { stock: Math.max(0, row.stock - 1) })}
                className="px-2.5 py-2 text-sm text-slate-500 hover:text-slate-900"
              >
                −
              </button>
              <input
                type="number"
                min={0}
                value={row.stock}
                onChange={(e) =>
                  update(i, { stock: Math.max(0, Math.round(Number(e.target.value) || 0)) })
                }
                className="w-16 border-x border-slate-200 py-2 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label="Increase stock"
                onClick={() => update(i, { stock: row.stock + 1 })}
                className="px-2.5 py-2 text-sm text-slate-500 hover:text-slate-900"
              >
                +
              </button>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                row.stock === 0
                  ? "bg-red-100 text-red-600"
                  : row.stock <= 5
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {row.stock === 0 ? "Sold out" : row.stock <= 5 ? "Low" : "In stock"}
            </span>
            <button
              type="button"
              aria-label="Remove size"
              onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
              className="ml-auto rounded border border-slate-200 px-2 py-1 text-xs text-slate-400 hover:border-red-300 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => addRow()}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
        >
          + Add size
        </button>
        <select
          value=""
          onChange={(e) => {
            const preset = PRESETS.find((p) => p.label === e.target.value);
            if (preset) applyPreset(preset.sizes);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none"
        >
          <option value="" disabled>
            Add preset…
          </option>
          {PRESETS.map((p) => (
            <option key={p.label} value={p.label}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Stock 0 shows the size as sold out on the storefront.
      </p>
    </div>
  );
}
