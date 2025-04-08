import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";

import { CreateRoleDto } from "../../../dtos/create-role-dto";

/**
 * Array of table columns for the roles table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const PermissionsTableColumns = (): ColumnDef<CreateRoleDto>[] => {
  return [
    {
      accessorKey: "featureName",
      enableSorting: false,
      header: ({ column }) => (
        <DTColumnHeader column={column} title="Feature" />
      ),
      cell: ({ row }) => (
        <div className="w-auto truncate font-medium">
          {row.getValue("featureName")}
        </div>
      ),
    },
    {
      accessorKey: "all",
      enableSorting: false,
      header: ({ column }) => (
        <DTColumnHeader column={column} title="Full Access" />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.original.all} className="translate-y-[2px]" />
      ),
    },
    {
      accessorKey: "view",
      enableSorting: false,
      header: ({ column }) => <DTColumnHeader column={column} title="View" />,
      cell: ({ row }) => (
        <div className="p-2">
          {" "}
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="translate-y-[2px]"
          />
        </div>
      ),
    },
    {
      accessorKey: "create",
      enableSorting: false,
      header: ({ column }) => <DTColumnHeader column={column} title="Create" />,
      cell: ({ row }) => (
        <div className="p-2">
          {" "}
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="translate-y-[2px]"
          />
        </div>
      ),
    },
    {
      accessorKey: "edit",
      enableSorting: false,
      header: ({ column }) => <DTColumnHeader column={column} title="Edit" />,
      cell: ({ row }) => (
        <div className="p-2">
          {" "}
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="translate-y-[2px]"
          />
        </div>
      ),
    },
    {
      accessorKey: "delete",
      enableSorting: false,
      header: ({ column }) => <DTColumnHeader column={column} title="Delete" />,
      cell: ({ row }) => (
        <div className="p-2">
          {" "}
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="translate-y-[2px]"
          />
        </div>
      ),
    },
  ];
};
