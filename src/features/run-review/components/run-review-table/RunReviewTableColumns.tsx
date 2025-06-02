import { Checkbox } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { CellContext, ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getColumnName } from "../../constants/column-display-names";
import { RunReviewTableDTO } from "../../dtos/run-review-table-dto";
import { RunReviewRowActions } from "../run-review-row-actions/RunReviewRowActions";
import { RunReviewTableCellLink } from "./RunReviewTableCellLink";

/**
 * Returns the complete column configuration in this order:
 * 1. Row selection
 * 2. File name column (`docName`)
 * 3. All dynamic columns (even duplicates)
 * 4. Remaining static columns
 * 5. Actions column
 */
export const getRunReviewTableColumns = (
  data: RunReviewTableDTO[],
): ColumnDef<RunReviewTableDTO>[] => {
  const dynamicCols: { name: string; index: number }[] = [];

  // Collect all dynamic columns (allowing duplicates)
  data.forEach((row) => {
    row.columns?.forEach((col, idx) => {
      dynamicCols.push({ name: col.name ?? `Unnamed ${idx}`, index: idx });
    });
  });

  return [
    // ✅ Row selection
    {
      accessorKey: "id",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
    },

    // ✅ File name column
    {
      accessorKey: "docName",
      header: ({ column }) => (
        <DTColumnHeader
          className="capitalize"
          column={column}
          title={getColumnName("docName")}
        />
      ),
      cell: ({ row }) => {
        const { id, docName } = row.original;
        return (
          <RunReviewTableCellLink rowId={id || "rowId"} cellValue={docName} />
        );
      },
    },

    // ✅ Dynamic columns
    ...dynamicCols.map((col, i) => {
      const colId = `${col.name}-${i}`;

      return {
        id: colId,
        accessorFn: (row: RunReviewTableDTO) =>
          row.columns?.[col.index]?.value ?? "",
        header: ({ column }: HeaderContext<RunReviewTableDTO, unknown>) => (
          <DTColumnHeader
            column={column}
            title={col.name}
            className="capitalize"
          />
        ),
        cell: ({ row }: CellContext<RunReviewTableDTO, unknown>) => (
          <div className="truncate w-36 font-medium">{row.getValue(colId)}</div>
        ),
      };
    }),

    // ✅ Remaining static columns
    {
      accessorKey: "submitForFineTuning",
      header: ({ column }) => (
        <DTColumnHeader
          className="capitalize"
          column={column}
          title={getColumnName("submitForFineTuning")}
        />
      ),
      cell: ({ row }) => {
        const rowValue = row.getValue("submitForFineTuning") ? "Yes" : "No";
        return <div className="w-auto font-medium">{rowValue}</div>;
      },
    },
    {
      accessorKey: "createdOn",
      header: ({ column }) => (
        <DTColumnHeader
          className="w-[5rem] capitalize"
          column={column}
          title={getColumnName("createdOn")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-auto truncate font-medium">
          {dateFormatter(row.getValue("createdOn"))}
        </div>
      ),
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DTColumnHeader
          className="w-auto capitalize"
          column={column}
          title={getColumnName("createdBy")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-auto truncate font-medium">
          {row.getValue("createdBy")}
        </div>
      ),
    },
    {
      accessorKey: "accuracy",
      header: ({ column }) => (
        <DTColumnHeader
          className="w-auto capitalize"
          column={column}
          title={getColumnName("accuracy")}
        />
      ),
      cell: ({ row }) => (
        <div className="w-auto truncate font-medium">
          {row.getValue("accuracy")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DTColumnHeader
          className="w-12"
          column={column}
          title={getColumnName("status")}
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="w-auto truncate px-2.5 py-1.5 font-medium capitalize"
        >
          {row.getValue("status")}
        </Badge>
      ),
    },

    // ✅ Actions column
    {
      id: "actions",
      header: ({ column }) => (
        <DTColumnHeader className="w-7" column={column} title={""} />
      ),
      cell: ({ row }) => <RunReviewRowActions rowId={row.original.id} />,
    },
  ];
};
