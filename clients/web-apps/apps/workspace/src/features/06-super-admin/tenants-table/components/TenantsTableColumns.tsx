import { Checkbox } from "@avplatform/ui";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { CountriesEnum, CurrenciesEnum } from "@avplatform/ui/enums";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { TenantsTableDto } from "../dtos/tenants-table-dto";
import { formatSecondsToCompactDuration, round2 } from "../utils";
import { formatBytes } from "../utils/file-uploader-util";
import { TenantRowActions } from "./tenant-row-actions/TenantRowActions";

/**
 * Array of table columns for the tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const tenantsTableColumns: ColumnDef<TenantsTableDto>[] = [
  // SELECT
  {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
  },

  // CORE
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => (
      <div className="truncate max-w-72 font-medium" title={row.getValue("name")}>
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => <div className="truncate">{row.getValue("type")}</div>,
  },
  {
    accessorKey: "activePlan",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("activePlan")} />
    ),

    // To support plan filter filter
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue?.length) return true;

      const plan = row.getValue<string>(columnId) ?? "Unknown";
      return filterValue.includes(plan);
    },

    cell: ({ row }) => {
      const plan = (row.getValue("activePlan") as string) ?? "Unknown";
      return <div className="truncate">{plan}</div>;
    },
  },
  {
    accessorKey: "renewalDate",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("renewalDate")} />
    ),
    cell: ({ row }) => formatDate(row.getValue<Date>("renewalDate")),
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("currency")} />
    ),
    cell: ({ row }) => (
      <div className="truncate">{getEnumValueByKey(CurrenciesEnum, row.getValue("currency"))}</div>
    ),
  },
  {
    accessorKey: "resourceType",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("resourceType")} />
    ),
    cell: ({ row }) => <div className="truncate">{row.getValue("resourceType")}</div>,
  },

  // DATES
  {
    accessorKey: "effectiveDate",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("effectiveDate")} />
    ),
    cell: ({ row }) => formatDate(row.getValue<Date>("effectiveDate")),
  },
  {
    accessorKey: "expiresOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("expiresOn")} />
    ),
    cell: ({ row }) => formatDate(row.getValue<Date>("expiresOn")),
  },

  // BUSINESS
  {
    accessorKey: "domain",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("domain")} />
    ),
    cell: ({ row }) => row.getValue("domain") || FALLBACK_VALUE,
  },
  {
    accessorKey: "country",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("country")} />
    ),
    cell: ({ row }) => getEnumValueByKey(CountriesEnum, row.getValue("country")) ?? FALLBACK_VALUE,
  },
  {
    accessorKey: "numberOfEmployees",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("numberOfEmployees")}
      />
    ),
    cell: ({ row }) => row.getValue("numberOfEmployees") ?? FALLBACK_VALUE,
  },
  {
    accessorKey: "industry",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("industry")} />
    ),
    cell: ({ row }) => row.getValue("industry") || FALLBACK_VALUE,
  },

  // METRICS
  {
    accessorKey: "publishAgent",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("publishAgent")} />
    ),
    cell: ({ row }) => row.getValue("publishAgent") || FALLBACK_VALUE,
  },
  {
    accessorKey: "totalJobs",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("totalJobs")} />
    ),
    cell: ({ row }) => row.getValue("totalJobs") ?? FALLBACK_VALUE,
  },
  {
    accessorKey: "totalUsers",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("totalUsers")} />
    ),
    cell: ({ row }) => row.getValue("totalUsers"),
  },
  {
    accessorKey: "availableCredits",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("availableCredits")}
      />
    ),
    cell: ({ row }) => round2(row.getValue("availableCredits")),
  },
  {
    accessorKey: "consumedCredits",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("consumedCredits")}
      />
    ),
    cell: ({ row }) => round2(row.getValue("consumedCredits")),
  },
  {
    accessorKey: "totalExecutionTime",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("totalExecutionTime")}
      />
    ),
    cell: ({ row }) => formatSecondsToCompactDuration(row.getValue("totalExecutionTime")),
  },
  {
    accessorKey: "storageSize",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("storageSize")} />
    ),
    cell: ({ row }) => formatBytes(row.getValue("storageSize") || 0),
  },

  // FLAGS
  {
    accessorKey: "isDisabled",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("isDisabled")} />
    ),
    cell: ({ row }) => (row.getValue("isDisabled") ? "Yes" : "No"),
  },

  // AUDIT
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdBy")} />
    ),
    cell: ({ row }) => row.getValue("createdBy") || FALLBACK_VALUE,
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdOn")} />
    ),
    cell: ({ row }) => formatDate(row.getValue("createdOn")),
  },
  {
    accessorKey: "lastModifiedBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("lastModifiedBy")}
      />
    ),
    cell: ({ row }) => row.getValue("lastModifiedBy") || FALLBACK_VALUE,
  },
  {
    accessorKey: "lastModifiedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => formatDate(row.getValue<Date>("lastModifiedOn")),
  },

  createDTActionsColumn<TenantsTableDto>({
    renderCell: (row) => <TenantRowActions rowId={row.id ?? "rowId"} />,
  }),
];
