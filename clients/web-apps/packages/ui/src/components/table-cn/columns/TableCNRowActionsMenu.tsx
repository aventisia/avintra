import { MoreHorizontal } from "lucide-react";
import type * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { cn } from "@/ui/lib";

import { TABLE_CN_PANEL_CLASS_NAME } from "../constants/table-cn-class-names.constant";

type TableCNRowActionsMenuProps = React.PropsWithChildren<{
  ariaLabel: string;
  contentClassName?: string;
}>;

/**
 * Ellipsis button opening a row's action menu items; it brightens while its row is hovered.
 */
export const TableCNRowActionsMenu = ({
  ariaLabel,
  contentClassName,
  children,
}: TableCNRowActionsMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label={ariaLabel}
      className={cn(
        "inline-grid size-7 place-items-center rounded-lg text-slate-400 outline-none transition-colors",
        "hover:bg-slate-200/70 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500/50 group-hover/row:text-slate-600",
        "data-[state=open]:bg-slate-200/70 data-[state=open]:text-slate-800",
      )}
    >
      <MoreHorizontal className="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      sideOffset={6}
      className={cn(
        TABLE_CN_PANEL_CLASS_NAME,
        "flex w-fit min-w-36 max-w-none flex-col p-1.5",
        contentClassName,
      )}
    >
      {children}
    </DropdownMenuContent>
  </DropdownMenu>
);
