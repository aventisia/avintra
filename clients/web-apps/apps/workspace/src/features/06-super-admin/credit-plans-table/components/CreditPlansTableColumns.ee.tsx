import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names.ee";
import { CreditPlansTableDto } from "../dtos/credit-plans-table-dto.ee";
import { ServiceTypeEnum } from "../enums/service-type-enum.ee";
import { UnitTypeEnum } from "../enums/unit-type-enum.ee";
import { CreditPlansRowActions } from "./credit-plans-row-actions/CreditPlansRowActions.ee";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<CreditPlansTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const creditPlansTableColumns: ColumnDef<CreditPlansTableDto>[] = [
  getTableCNSelectColumn<CreditPlansTableDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  // Service Type
  {
    accessorKey: "serviceType",
    meta: { label: getColumnName("serviceType") },
    header: renderHeader("serviceType"),
    cell: ({ row }) => {
      const serviceTypeValue =
        ServiceTypeEnum[row.getValue("serviceType") as keyof typeof ServiceTypeEnum];
      return <div className="w-auto font-medium">{serviceTypeValue || "N/A"}</div>;
    },
  },
  // Unit Type
  {
    accessorKey: "unitType",
    meta: { label: getColumnName("unitType") },
    header: renderHeader("unitType"),
    cell: ({ row }) => {
      const unitTypeValue = UnitTypeEnum[row.getValue("unitType") as keyof typeof UnitTypeEnum];
      return <div className="w-auto font-medium">{unitTypeValue || "N/A"}</div>;
    },
  },
  // One Unit
  {
    accessorKey: "oneUnit",
    meta: { label: getColumnName("oneUnit") },
    header: renderHeader("oneUnit"),
    cell: ({ row }) => {
      return (
        <div className="font-mono tabular-nums w-auto font-medium">
          {row.getValue("oneUnit") || "N/A"}
        </div>
      );
    },
  },
  // Credits
  {
    accessorKey: "credits",
    meta: { label: getColumnName("credits") },
    header: renderHeader("credits"),
    cell: ({ row }) => {
      return (
        <div className="font-mono tabular-nums w-auto font-medium">
          {row.getValue("credits") || "N/A"}
        </div>
      );
    },
  },
  getRowActionsColumn<CreditPlansTableDto>({
    actions: ({ row }) => <CreditPlansRowActions rowId={row.original.id || "rowId"} />,
  }),
];
