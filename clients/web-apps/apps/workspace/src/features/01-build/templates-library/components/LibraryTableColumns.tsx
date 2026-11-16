import { PersonAvatar } from "@avplatform/ui/avatar";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TEMPLATE_ACCESS_OPTIONS, TEMPLATE_TYPES } from "../constants/library.constant";
import { AvPlatformTemplatesDto } from "../dtos/avplatform-templates-dtos";
import { getTemplateAccessLabel, getTemplateTypeLabel } from "../utils/template-attributes.util";
import { TemplateIntegrations } from "./TemplateIntegrations";
import { TemplateMark } from "./TemplateMark";

/**
 * Columns of the library table, with toolbar filters for type and access.
 */
export const libraryTableColumns: ColumnDef<AvPlatformTemplatesDto>[] = [
  {
    accessorKey: "name",
    meta: { label: "Name" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Name" />,
    cell: ({ row }) => (
      <div className="flex min-w-0 max-w-[32rem] items-center gap-2.5 whitespace-nowrap">
        <TemplateMark type={row.original.type} size="sm" />
        <span className="min-w-0 truncate font-semibold text-ink" title={row.original.name}>
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    meta: {
      label: "Type",
      variant: "multiSelect",
      options: TEMPLATE_TYPES.map(({ value, label, icon }) => ({ value, label, icon })),
    },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Type" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-ink-2">
        {getTemplateTypeLabel(row.original.type)}
      </span>
    ),
  },
  {
    id: "access",
    accessorFn: (template) => getTemplateAccessLabel(template.accessType),
    meta: { label: "Access", variant: "multiSelect", options: TEMPLATE_ACCESS_OPTIONS },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Access" />,
    cell: ({ getValue }) => <span className="text-ink-2">{String(getValue())}</span>,
  },
  {
    id: "integrations",
    enableSorting: false,
    meta: { label: "Integrations" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Integrations" />,
    cell: ({ row }) => <TemplateIntegrations icons={row.original.icons} limit={6} />,
  },
  {
    id: "tags",
    accessorFn: (template) => template.tags?.join(", ") ?? "",
    enableSorting: false,
    meta: { label: "Tags" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Tags" />,
    cell: ({ getValue }) => (
      <span className="block max-w-60 truncate text-ink-2" title={String(getValue())}>
        {String(getValue()) || FALLBACK_VALUE}
      </span>
    ),
  },
  {
    accessorKey: "createdBy",
    meta: { label: "Created by" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Created by" />,
    cell: ({ row }) =>
      row.original.createdBy ? (
        <span className="flex items-center gap-2 whitespace-nowrap text-ink-2">
          <PersonAvatar name={row.original.createdBy} />
          {row.original.createdBy}
        </span>
      ) : (
        FALLBACK_VALUE
      ),
  },
  {
    accessorKey: "usagesCount",
    meta: { label: "Clones" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Clones" />,
    cell: ({ row }) => <span className="tabular-nums text-ink-2">{row.original.usagesCount}</span>,
  },
  {
    accessorKey: "createdOn",
    meta: { label: "Created on" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Created on" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-ink-2">{formatDate(row.original.createdOn)}</span>
    ),
  },
];
