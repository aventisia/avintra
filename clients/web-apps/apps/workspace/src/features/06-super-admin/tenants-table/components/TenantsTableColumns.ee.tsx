import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { CountriesEnum, CurrenciesEnum } from "@avplatform/ui/enums";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext, SortingFn } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

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

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<TenantsTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const tenantsTableColumns: ColumnDef<TenantsTableDto>[] = [
  // SELECT
  getTableCNSelectColumn<TenantsTableDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),

  // CORE
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => (
      <TenantNameCell tenantId={row.original.id ?? ""} tenantName={row.getValue("name")} />
    ),
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
    cell: ({ row }) => <div className="truncate">{row.getValue("type")}</div>,
  },
  {
    accessorKey: "activePlan",
    meta: { label: getColumnName("activePlan") },
    header: renderHeader("activePlan"),

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
    meta: { label: getColumnName("renewalDate") },
    header: renderHeader("renewalDate"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("renewalDate"))}
      </span>
    ),
  },
  {
    accessorKey: "currency",
    meta: { label: getColumnName("currency") },
    header: renderHeader("currency"),
    cell: ({ row }) => (
      <div className="truncate">{getEnumValueByKey(CurrenciesEnum, row.getValue("currency"))}</div>
    ),
  },
  {
    accessorKey: "resourceType",
    meta: { label: getColumnName("resourceType") },
    header: renderHeader("resourceType"),
    cell: ({ row }) => <div className="truncate">{row.getValue("resourceType")}</div>,
  },

  // DATES
  {
    accessorKey: "effectiveDate",
    meta: { label: getColumnName("effectiveDate") },
    header: renderHeader("effectiveDate"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("effectiveDate"))}
      </span>
    ),
  },
  {
    accessorKey: "expiresOn",
    meta: { label: getColumnName("expiresOn") },
    header: renderHeader("expiresOn"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{formatDate(row.getValue<Date>("expiresOn"))}</span>
    ),
  },

  // BUSINESS
  {
    accessorKey: "domain",
    meta: { label: getColumnName("domain") },
    header: renderHeader("domain"),
    cell: ({ row }) => row.getValue("domain") || FALLBACK_VALUE,
  },
  {
    accessorKey: "country",
    meta: { label: getColumnName("country") },
    header: renderHeader("country"),
    cell: ({ row }) => getEnumValueByKey(CountriesEnum, row.getValue("country")) ?? FALLBACK_VALUE,
  },
  {
    accessorKey: "numberOfEmployees",
    meta: { label: getColumnName("numberOfEmployees") },
    header: renderHeader("numberOfEmployees"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.getValue<number>("numberOfEmployees") ?? FALLBACK_VALUE}
      </span>
    ),
  },
  {
    accessorKey: "industry",
    meta: { label: getColumnName("industry") },
    header: renderHeader("industry"),
    cell: ({ row }) => row.getValue("industry") || FALLBACK_VALUE,
  },

  // METRICS
  {
    accessorKey: "publishAgent",
    meta: { label: getColumnName("publishAgent") },
    header: renderHeader("publishAgent"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.getValue<number>("publishAgent") || FALLBACK_VALUE}
      </span>
    ),
  },
  {
    accessorKey: "totalJobs",
    meta: { label: getColumnName("totalJobs") },
    header: renderHeader("totalJobs"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.getValue<number>("totalJobs") ?? FALLBACK_VALUE}
      </span>
    ),
  },
  {
    accessorKey: "totalUsers",
    meta: { label: getColumnName("totalUsers") },
    header: renderHeader("totalUsers"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{row.getValue<number>("totalUsers")}</span>
    ),
  },
  {
    accessorKey: "availableCredits",
    meta: { label: getColumnName("availableCredits") },
    header: renderHeader("availableCredits"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{round2(row.getValue("availableCredits"))}</span>
    ),
  },
  {
    accessorKey: "consumedCredits",
    meta: { label: getColumnName("consumedCredits") },
    header: renderHeader("consumedCredits"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{round2(row.getValue("consumedCredits"))}</span>
    ),
  },
  {
    accessorKey: "totalExecutionTime",
    meta: { label: getColumnName("totalExecutionTime") },
    header: renderHeader("totalExecutionTime"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatSecondsToCompactDuration(row.getValue("totalExecutionTime"))}
      </span>
    ),
  },
  {
    accessorKey: "storageSize",
    meta: { label: getColumnName("storageSize") },
    header: renderHeader("storageSize"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatBytes(row.getValue("storageSize") || 0)}
      </span>
    ),
  },
  {
    accessorKey: "lastLoginDate",
    meta: { label: getColumnName("lastLoginDate") },
    header: renderHeader("lastLoginDate"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("lastLoginDate"))}
      </span>
    ),
  },

  // FLAGS
  {
    accessorKey: "isDisabled",
    meta: { label: getColumnName("isDisabled") },
    header: renderHeader("isDisabled"),
    cell: ({ row }) => (row.getValue("isDisabled") ? "Yes" : "No"),
  },

  // AUDIT
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: renderHeader("createdBy"),
    cell: ({ row }) => row.getValue("createdBy") || FALLBACK_VALUE,
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: renderHeader("createdOn"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{formatDate(row.getValue("createdOn"))}</span>
    ),
  },
  {
    accessorKey: "lastModifiedBy",
    meta: { label: getColumnName("lastModifiedBy") },
    header: renderHeader("lastModifiedBy"),
    cell: ({ row }) => row.getValue("lastModifiedBy") || FALLBACK_VALUE,
  },
  {
    accessorKey: "lastModifiedOn",
    meta: { label: getColumnName("lastModifiedOn") },
    header: renderHeader("lastModifiedOn"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("lastModifiedOn"))}
      </span>
    ),
  },

  getRowActionsColumn<TenantsTableDto>({
    actions: ({ row }) => <TenantRowActions rowId={row.original.id ?? "rowId"} />,
  }),
];
