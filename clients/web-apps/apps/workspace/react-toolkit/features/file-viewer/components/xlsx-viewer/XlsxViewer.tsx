import { ScrollArea, ScrollBar } from "@avplatform/ui/scroll";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface XlsxViewerProps {
  fileUrl: string;
}

interface SheetData {
  name: string;
  rows: (string | number)[][];
}

const XlsxViewer = ({ fileUrl }: XlsxViewerProps) => {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to fetch spreadsheet");
        const buffer = await res.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });

        if (cancelled) return;

        const parsed = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name];
          const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
            header: 1,
            defval: "",
          });
          return { name, rows };
        });

        setSheets(parsed);
        setActiveSheet(0);
        setError(null);
      } catch (err) {
        if (!cancelled) setError("Unable to preview this spreadsheet.");
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  if (error) {
    return <p className="p-4 text-sm text-muted-foreground">{error}</p>;
  }

  if (sheets.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Loading spreadsheet…</p>;
  }

  const current = sheets[activeSheet];

  return (
    <div className="flex h-full flex-col">
      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-2 py-1">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setActiveSheet(i)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                i === activeSheet
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="overflow-auto">
          <table className="w-full border-collapse text-xs">
            <tbody>
              {current.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={`border border-border px-2 py-1 ${
                        r === 0 ? "bg-accent font-semibold" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default XlsxViewer;
