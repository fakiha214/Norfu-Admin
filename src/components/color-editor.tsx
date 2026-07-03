"use client";

import { useState } from "react";

type Row = { name: string; hex: string };

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// Editable colour rows with a native colour picker; submits via a
// hidden input using the "Name | #hex" line format the action parses.
export default function ColorEditor({
  name,
  defaultRows,
}: {
  name: string;
  defaultRows: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(defaultRows);

  const serialized = rows
    .filter((r) => r.name.trim())
    .map((r) => `${r.name.trim()} | ${HEX_RE.test(r.hex) ? r.hex : "#cccccc"}`)
    .join("\n");

  const update = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div>
      <input type="hidden" name={name} value={serialized} />

      <div className="space-y-2">
        {rows.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-400">
            No colours yet — add one below.
          </p>
        )}
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <label
              className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-300"
              title="Pick colour"
            >
              <span
                className="absolute inset-0"
                style={{ backgroundColor: HEX_RE.test(row.hex) ? row.hex : "#cccccc" }}
              />
              <input
                type="color"
                value={HEX_RE.test(row.hex) ? row.hex : "#cccccc"}
                onChange={(e) => update(i, { hex: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
            <input
              value={row.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Colour name (e.g. Ecru)"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
            <input
              value={row.hex}
              onChange={(e) => update(i, { hex: e.target.value.trim() })}
              placeholder="#D8CFC0"
              className={`w-24 rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:border-slate-900 ${
                HEX_RE.test(row.hex) ? "border-slate-300" : "border-amber-400"
              }`}
            />
            <button
              type="button"
              aria-label="Remove colour"
              onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
              className="ml-auto rounded border border-slate-200 px-2 py-1 text-xs text-slate-400 hover:border-red-300 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { name: "", hex: "#cccccc" }])}
        className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
      >
        + Add colour
      </button>
      <p className="mt-2 text-xs text-slate-400">
        Shown as swatches on product cards and the product page.
      </p>
    </div>
  );
}
