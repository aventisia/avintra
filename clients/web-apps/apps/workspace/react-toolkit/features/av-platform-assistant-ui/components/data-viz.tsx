/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@avplatform/ui/lib";
import { memo, useMemo } from "react";

/**
 * Lightweight, dependency-free data visualization for chat responses.
 *
 * Detects JSON data blocks (e.g. ```json { "data": [...] } ```) and renders
 * them as a sortable table or a simple bar chart. No external chart library is
 * required, so it works identically in both the workspace and studio apps.
 *
 * Supported shapes:
 *   - An array of objects: [{ "label": "A", "value": 10 }, ...]
 *   - An object with a `data` array: { "data": [...], "type": "bar"|"table" }
 *   - An object with a `labels` + `values` pair: { "labels": [...], "values": [...] }
 */

type DataRow = Record<string, any>;

interface DataVizProps {
  /** Raw JSON string to visualize. */
  json: string;
  className?: string;
}

const MAX_BARS = 20;

function parseData(json: string): { rows: DataRow[]; type: "table" | "bar" } | null {
  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  // { data: [...], type: "bar"|"table" }
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) {
    const type = parsed.type === "bar" ? "bar" : "table";
    return { rows: parsed.data as DataRow[], type };
  }

  // { labels: [...], values: [...] } -> bar chart
  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray(parsed.labels) &&
    Array.isArray(parsed.values)
  ) {
    const rows = (parsed.labels as any[]).map((label, i) => ({
      label: String(label),
      value: Number(parsed.values[i] ?? 0),
    }));
    return { rows, type: "bar" };
  }

  // Array of objects
  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
    return { rows: parsed as DataRow[], type: "table" };
  }

  return null;
}

const BarChart = memo(function BarChart({ rows }: { rows: DataRow[] }) {
  const data = useMemo(() => {
    const items = rows.slice(0, MAX_BARS).map((row) => {
      const label = String(row.label ?? row.name ?? Object.values(row)[0] ?? "");
      const value = Number(row.value ?? row.count ?? Object.values(row)[1] ?? 0);
      return { label, value: Number.isFinite(value) ? value : 0 };
    });
    const max = Math.max(1, ...items.map((i) => i.value));
    return { items, max };
  }, [rows]);

  if (data.items.length === 0) return null;

  return (
    <div className="aui-dataviz-bar w-full overflow-x-auto rounded-lg border border-line/50 bg-sunken/60 p-3">
      <div className="flex h-40 items-end gap-2">
        {data.items.map((item, i) => (
          <div key={i} className="flex min-w-8 flex-1 flex-col items-center gap-1">
            <span className="text-2xs text-muted-foreground">{item.value}</span>
            <div
              className="w-full rounded-t bg-primary/70"
              style={{ height: `${Math.max(2, (item.value / data.max) * 100)}%` }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="max-w-16 truncate text-2xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const DataTable = memo(function DataTable({ rows }: { rows: DataRow[] }) {
  const columns = useMemo(() => {
    const keys = new Set<string>();
    rows.forEach((row) => Object.keys(row).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [rows]);

  if (rows.length === 0 || columns.length === 0) return null;

  return (
    <div className="aui-dataviz-table w-full overflow-x-auto rounded-lg border border-line/50">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="bg-sunken px-2 py-1.5 text-left font-medium first:rounded-tl-lg last:rounded-tr-lg"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td
                  key={col}
                  className="border-t border-line/40 px-2 py-1.5 text-left last:border-r"
                >
                  {String(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export const DataViz = memo(function DataViz({ json, className }: DataVizProps) {
  const viz = useMemo(() => parseData(json), [json]);

  if (!viz) return null;

  return (
    <div className={cn("aui-dataviz my-2 w-full", className)}>
      {viz.type === "bar" ? <BarChart rows={viz.rows} /> : <DataTable rows={viz.rows} />}
    </div>
  );
});
