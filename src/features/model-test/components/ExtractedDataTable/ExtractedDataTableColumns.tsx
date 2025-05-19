/* eslint-disable @typescript-eslint/no-explicit-any */
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ExtractedDataDto } from "../../dtos/ extracted-data-dto";
import { ExtractedDataTableCellLink } from "./DataTableCellLink";

// Function to generate dynamic columns
export const generateDynamicColumns = (
  data: ExtractedDataDto[] | undefined,
): ColumnDef<ExtractedDataDto>[] => {
  if (!data) return [];

  //Get dynamic data fields
  const dynamicFields = data.flatMap((item) => Object.keys(item.dynamicFields));

  // Ensure unique dynamic fields
  const uniqueFields = Array.from(new Set(dynamicFields));

  // Define columns: Static columns like docName, accuracy, and dynamic fields
  const columns: ColumnDef<ExtractedDataDto>[] = [
    {
      accessorKey: "docName",
      header: ({ column }) => (
        <DTColumnHeader
          className="capitalize"
          column={column}
          title="Document Name"
        />
      ),
      cell: ({ row }) => (
        <ExtractedDataTableCellLink
          rowId={row.original.docId}
          cellValue={row.getValue("docName")}
        />
      ),
    },
    ...uniqueFields.map((field) => ({
      accessorKey: field,
      header: ({ column }: { column: any }) => (
        <DTColumnHeader column={column} title={field} />
      ),
      cell: ({ row }: { row: any }) => (
        <div className="w-auto font-medium">{row.getValue(field)}</div>
      ),
    })),
    {
      accessorKey: "accuracy",
      header: ({ column }) => (
        <DTColumnHeader className="w-12" column={column} title="Accuracy" />
      ),
      cell: ({ row }) => (
        <div className="w-auto font-medium">{row.getValue("accuracy")}</div>
      ),
    },

    //   {
    //     id: "actions",
    //     header: ({ column }) => (
    //       <DTColumnHeader className="w-7" column={column} title="" />
    //     ),
    //     cell: ({ row }) => <ModelRowActions rowId={row.original.docName || "rowId"} />,
    //   },
  ];

  return columns;
};
