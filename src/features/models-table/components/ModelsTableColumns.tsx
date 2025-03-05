import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { getColumnName } from "../constants/column-display-names";
import { ModelsTableDto } from "../dtos/models-table-dto";
import { ModelRowActions } from "./model-row-actions/ModelRowActions";
import { Badge } from "@/react-toolkit/ui/badge";
import { ModelStatusEnum } from "../enums/model-status-enum";
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
        className="capitalize"
        column={column}
        title={getColumnName("name")}
      />
    ),

    cell: ({ row }) => {
      const { id, name, description } = row.original;
      return (
        <div className="flex w-fit flex-col justify-start">
          <ModelsTableCellLink rowId={id || "rowId"} cellValue={name} />
          <span className="w-48 truncate text-xs text-gray-600">
            {description}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "llm",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("llm")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("llm")}</div>
    ),
  },
  {
    accessorKey: "docsProcessed",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-16"
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
        className="w-12"
        column={column}
        title={getColumnName("accuracy")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("accuracy")}</div>
    ),
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
        {format(row.getValue("createdOn"), "dd MMM, yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "trainedOn",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[5rem]"
        column={column}
        title={getColumnName("trainedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {format(row.getValue("trainedOn"), "dd MMM, yyyy")}
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
    cell: ({ row }) => {
      const status =
        row.getValue("status") == ModelStatusEnum.Active
          ? "success-foreground"
          : "destructive";
      return (
        <Badge
          variant={"outline"}
          className={`w-auto truncate px-2.5 py-1.5 font-medium capitalize text-${status} `}
        >
          {row.getValue("status")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DTColumnHeader className="w-7" column={column} title={""} />
    ),
    cell: ({ row }) => (
      // Render the model row actions component
      <ModelRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];
