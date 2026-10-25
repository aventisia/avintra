import { type Table } from "@tanstack/react-table";

type ExportTableCNToCsvOptions = {
  /** File name without the `.csv` extension. */
  fileName: string;
  /** Exports only the selected rows instead of every filtered row. */
  onlySelected?: boolean;
};

const toCsvText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(toCsvText).join("; ");
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const FORMULA_PREFIX_PATTERN = /^[=+\-@\t\r]/;

const toCsvCell = (value: unknown) => {
  const rawText = toCsvText(value);
  // IMPORTANT NOTE: Spreadsheets run cells starting with = + - @ as formulas (CSV injection).
  const text =
    typeof value !== "number" && FORMULA_PREFIX_PATTERN.test(rawText) ? `'${rawText}` : rawText;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

/**
 * CSV text for a header row and data rows; arrays are joined with "; ".
 */
export const toTableCNCsvText = (header: unknown[], rows: unknown[][]) =>
  [header, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\r\n");

/**
 * Downloads the visible data columns of the filtered (or selected) rows as a CSV file.
 * Column headers come from `meta.label`; display columns such as select and actions are skipped.
 */
export const exportTableCNToCsv = <TData>(
  table: Table<TData>,
  { fileName, onlySelected = false }: ExportTableCNToCsvOptions,
) => {
  const columns = table.getVisibleLeafColumns().filter((column) => column.accessorFn !== undefined);
  const rows = onlySelected
    ? table.getFilteredSelectedRowModel().rows
    : table.getFilteredRowModel().rows;

  const csvText = toTableCNCsvText(
    columns.map((column) => column.columnDef.meta?.label ?? column.id),
    rows.map((row) => columns.map((column) => row.getValue(column.id))),
  );

  const url = URL.createObjectURL(new Blob([csvText], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
