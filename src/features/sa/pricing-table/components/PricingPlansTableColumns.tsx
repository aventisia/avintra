import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { CurrenciesEnum } from "@aventisia/ui/enums";
import { dateFormatter, getEnumValueByKey } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { DeploymentTypeEnum } from "@/react-toolkit/enums/deployment-types-enum";
import { PricingComponentsEnum } from "@/react-toolkit/enums/pricing-components-enum";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";

import { getColumnName } from "../constants/column-display-names";
import { PricingPlansTableDto } from "../dtos/pricingPlans-table-dto";

import { PricingPlanRowActions } from "./pricingPlan-table-actions/PricingPlanRowActions";

/**
 * Array of table columns for the pricingplans table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const pricingPlansTableColumns: ColumnDef<PricingPlansTableDto>[] = [
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
    accessorKey: "pricingComponent",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("pricingComponent")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(
          PricingComponentsEnum,
          row.getValue("pricingComponent"),
        )}
      </div>
    ),
  },

  {
    accessorKey: "tenantType",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("tenantType")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("tenantType")
          ? getEnumValueByKey(DeploymentTypeEnum, row.getValue("tenantType"))
          : "Default"}
      </div>
    ),
  },

  {
    accessorKey: "tenantName",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("tenantName")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("tenantName") ?? "Default"}
      </div>
    ),
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("currency")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("currency")}
      </div>
    ),
  },

  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("unit")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("unit")}</div>
    ),
  },

  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("unitPrice")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {currencyFormater(
          row.getValue("unitPrice"),
          row.getValue<keyof typeof CurrenciesEnum>("currency"),
        )}
      </div>
    ),
  },
  {
    accessorKey: "frequency",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("frequency")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("frequency")}
      </div>
    ),
  },

  {
    accessorKey: "cola",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("cola")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("cola")}</div>
    ),
  },

  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("createdBy")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("createdBy")}
      </div>
    ),
  },

  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[7rem]"
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
    id: "actions",
    cell: ({ row }) => (
      // Render the pricingplans row actions component
      <PricingPlanRowActions rowId={row.original.id ?? "rowId"} />
    ),
  },
];
