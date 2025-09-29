import { Checkbox } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { ModelsTableDto } from "../dtos/models-table-dto";
import { TaskTypesEnum } from "../enums/tasks-type-enum";
import { formatSeconds } from "../utils/formatSeconds";

import { ModelRowActions } from "./model-row-actions/ModelRowActions";
import { ModelsTableCellLink } from "./ModelsTableCellLink";

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const modelsTableColumns: ColumnDef<ModelsTableDto>[] = [
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
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="capitalize"
        column={column}
        title={getColumnName("name")}
      />
    ),

    cell: ({ row }) => {
      const { id, name } = row.original;
      return <ModelsTableCellLink rowId={id || "rowId"} cellValue={name} />;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("type")}
      />
    ),
    cell: ({ row }) => {
      const typeValue =
        TaskTypesEnum[row.getValue("type") as keyof typeof TaskTypesEnum];
      return <div className="w-auto font-medium">{typeValue || "N/A"}</div>;
    },
  },
  {
    accessorKey: "llMs",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("llMs")}
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue("llMs") as string[];
      return (
        <div
          className="w-28 truncate font-medium"
          title={value && value.length > 0 ? value.join(", ") : ""}
        >
          {value && value.length > 0 ? value.join(", ") : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "docsProcessed",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("docsProcessed")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("docsProcessed")}</div>
    ),
  },
  {
    accessorKey: "accuracy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("accuracy")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("accuracy")}</div>
    ),
  },
  {
    accessorKey: "tokenCount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("tokenCount")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("tokenCount")}</div>
    ),
  },
  {
    accessorKey: "executionCount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("executionCount")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("executionCount")}</div>
    ),
  },
  {
    accessorKey: "failedCount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("failedCount")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("failedCount")}</div>
    ),
  },
  {
    accessorKey: "executionTime",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("executionTime")}
      />
    ),
    cell: ({ row }) => {
      const executionTimeFormattedValue =
        formatSeconds(row.getValue("executionTime")) || "0s";
      return (
        <div className="w-auto font-medium">{executionTimeFormattedValue}</div>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("isPublished")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">
        {row.getValue("isPublished") ? "Yes" : "No"}
      </div>
    ),
  },
  {
    accessorKey: "publishedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("publishedOn")}
      />
    ),
    cell: ({ row }) => {
      const publishedOnValue = row.getValue("publishedOn") as Date;
      return (
        <div className="w-auto font-medium">
          {publishedOnValue ? dateFormatter(publishedOnValue) : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
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
    accessorKey: "trainedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("trainedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatter(row.getValue("trainedOn"))}
      </div>
    ),
  },
  {
    accessorKey: "setupStatus",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("setupStatus")}
      />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant={"outline"}
          className={`w-auto truncate px-2.5 py-1.5 font-medium capitalize`}
        >
          {row.getValue("setupStatus")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={""} />
    ),
    cell: ({ row }) => (
      // Render the model row actions component
      <ModelRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];
