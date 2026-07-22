import { type Table } from "@tanstack/react-table";
import { Download } from "lucide-react";

import { Button } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";

/**
 * Props for the DTExportButton component.
 */
interface DTExportButtonProps<TData> {
  /** The table instance to export */
  table: Table<TData>;
  /** Table key for naming the export file */
  fileName: string;
}

/**
 * Exports TanStack Table data to a CSV file.
 *
 * @returns {JSX.Element} The DTExportButton component.
 */
export const DTExportButton = <TData,>({
  table,
  fileName,
}: DTExportButtonProps<TData>): JSX.Element => {
  // Handle the export logic
  const handleExport = () => {
    // Filter visible columns and exclude "actions" column
    const columns = table
      .getAllColumns()
      .filter((column) => column.getIsVisible() && column.id !== "actions");

    // Extract column headers (fallback to column ID if header is not a string)
    const headers = columns.map((column) => {
      const headerValue = column.columnDef.header;
      return typeof headerValue === "string" ? headerValue : column.id;
    });

    // Get filtered rows (respects active filters)
    const rows = table.getFilteredRowModel().rows;

    // Convert table data to CSV format
    const csvData = rows.map((row) =>
      columns.map((column) => {
        const cellValue = row.getValue(column.id);

        // Handle empty values
        if (cellValue === null || cellValue === undefined) {
          return "";
        }

        const stringValue = String(cellValue);

        // Escape special CSV characters (comma, quote, newline)
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      }),
    );

    // Combine headers and data into CSV string
    const csv = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");

    // Create downloadable CSV file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Generate filename with table key
    const finalFilename = `${fileName}.csv`;

    // Create temporary link to trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", finalFilename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    URL.revokeObjectURL(url);
  };

  // Return the component
  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="xs"
      className={cn("gap-2 text-sm tracking-wide")}
    >
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
};
