import { Checkbox } from "@avplatform/ui";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { CountriesEnum, CurrenciesEnum } from "@avplatform/ui/enums";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef, SortingFn } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names.ee";
import { TenantsTableDto } from "../dtos/tenants-table-dto.ee";
import { formatSecondsToCompactDuration, round2 } from "../utils";
import { formatBytes } from "../utils/file-uploader-util.ee";
import { TenantNameCell } from "./tenant-published-agents/TenantNameCell.ee";
import { TenantRowActions } from "./tenant-row-actions/TenantRowActions.ee";

/**
 * Plan rank used for sorting. Pro customers always appear at the top,
 * followed by Starter, then the remaining plans (Unknown last).
 */
const PLAN_RANK: Record<string, number> = {
  pro: 0,
  starter: 1,
};

const planSortingFn: SortingFn<TenantsTableDto> = (rowA, rowB) => {
  const planA = (rowA.getValue<string>("activePlan") ?? "Unknown").toLowerCase();
  const planB = (rowB.getValue<string>("activePlan") ?? "Unknown").toLowerCase();

  const rankA = PLAN_RANK[planA] ?? 99;
  const rankB = PLAN_RANK[planB] ?? 99;

  return rankA - rankB;
};

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
      <TenantNameCell tenantId={row.original.id ?? ""} tenantName={row.getValue("name")} />
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

    // Always rank Pro customers at the top (then Starter, then the rest).
    sortingFn: planSortingFn,

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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("renewalDate"))}
      </span>
    ),
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("effectiveDate"))}
      </span>
    ),
  },
  {
    accessorKey: "expiresOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("expiresOn")} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{formatDate(row.getValue<Date>("expiresOn"))}</span>
    ),
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.getValue<number>("numberOfEmployees") ?? FALLBACK_VALUE}
      </span>
    ),
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.getValue<number>("publishAgent") || FALLBACK_VALUE}
      </span>
    ),
  },
  {
    accessorKey: "totalJobs",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("totalJobs")} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.getValue<number>("totalJobs") ?? FALLBACK_VALUE}
      </span>
    ),
  },
  {
    accessorKey: "totalUsers",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("totalUsers")} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{row.getValue<number>("totalUsers")}</span>
    ),
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{round2(row.getValue("availableCredits"))}</span>
    ),
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{round2(row.getValue("consumedCredits"))}</span>
    ),
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatSecondsToCompactDuration(row.getValue("totalExecutionTime"))}
      </span>
    ),
  },
  {
    accessorKey: "storageSize",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("storageSize")} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatBytes(row.getValue("storageSize") || 0)}
      </span>
    ),
  },
  {
    accessorKey: "lastLoginDate",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("lastLoginDate")} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("lastLoginDate"))}
      </span>
    ),
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{formatDate(row.getValue("createdOn"))}</span>
    ),
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("lastModifiedOn"))}
      </span>
    ),
  },

  createDTActionsColumn<TenantsTableDto>({
    renderCell: (row) => <TenantRowActions rowId={row.id ?? "rowId"} />,
  }),
];
