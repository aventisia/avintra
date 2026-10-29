import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { IByokUsers } from "../../dtos/byok-usage-dto.ee";

export const byokUsageUsersColumns = (tableKey: string): ColumnDef<IByokUsers>[] => [
  {
    accessorKey: "fullName",
    id: "fullName",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim() || row.username,
    header: ({ column }) => <DTColumnHeader tableKey={tableKey} column={column} title="User" />,
    cell: ({ row }) => {
      const fullName = `${row.original.firstName} ${row.original.lastName}`.trim();
      const initials = fullName
        .split(" ")
        .map((word) => word[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="flex h-7 w-7">
            <AvatarFallback className="border-none bg-primary-200 text-2xs capitalize tracking-wider text-secondary">
              {initials || "--"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{fullName || row.original.username}</p>
            {row.original.username && (
              <p className="text-xs text-muted-foreground">{row.original.username}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalConsumption",
    id: "totalConsumption",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title="Total consumption" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-medium tabular-nums">
        {row.original.totalConsumption.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
];
