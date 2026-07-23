import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { CreditPlansTableDto } from "../dtos/credit-plans-table-dto";
import { ServiceTypeEnum } from "../enums/service-type-enum";
import { UnitTypeEnum } from "../enums/unit-type-enum";
import { CreditPlansRowActions } from "./credit-plans-row-actions/CreditPlansRowActions";

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const creditPlansTableColumns: ColumnDef<CreditPlansTableDto>[] = [
  {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
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
  // Service Type
  {
    accessorKey: "serviceType",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("serviceType")} />
    ),
    cell: ({ row }) => {
      const serviceTypeValue =
        ServiceTypeEnum[row.getValue("serviceType") as keyof typeof ServiceTypeEnum];
      return <div className="w-auto font-medium">{serviceTypeValue || "N/A"}</div>;
    },
  },
  // Unit Type
  {
    accessorKey: "unitType",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("unitType")} />
    ),
    cell: ({ row }) => {
      const unitTypeValue = UnitTypeEnum[row.getValue("unitType") as keyof typeof UnitTypeEnum];
      return <div className="w-auto font-medium">{unitTypeValue || "N/A"}</div>;
    },
  },
  // One Unit
  {
    accessorKey: "oneUnit",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("oneUnit")} />
    ),
    cell: ({ row }) => {
      return <div className="w-auto font-medium">{row.getValue("oneUnit") || "N/A"}</div>;
    },
  },
  // Credits
  {
    accessorKey: "credits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("credits")} />
    ),
    cell: ({ row }) => {
      return <div className="w-auto font-medium">{row.getValue("credits") || "N/A"}</div>;
    },
  },
  // Actiosn
  {
    id: "actions",
    header: ({ column }) => <DTColumnHeader tableKey={TABLE_KEY} column={column} title={""} />,
    cell: ({ row }) => (
      // Render the model row actions component
      <CreditPlansRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];
