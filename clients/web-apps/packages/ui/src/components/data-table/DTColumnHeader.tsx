import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronUpDownIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { type Column } from "@tanstack/react-table";

import { Button } from "@/ui/components/buttons";
import { setDataTablePreferences } from "@/ui/components/data-table/dt-preferences-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { cn } from "@/ui/lib";

interface DTColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  tableKey: string;
  column: Column<TData, TValue>;
  title: string;
  enableHiding?: boolean;
}

export const DTColumnHeader = <TData, TValue>({
  tableKey,
  column,
  title,
  enableHiding = true,
  className,
}: DTColumnHeaderProps<TData, TValue>) => {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  // Sorting handler
  const handleSorting = (desc: boolean) => {
    column.toggleSorting(desc);
    setDataTablePreferences(tableKey, [{ id: column.id, desc }]);
  };

  // Hide column handler
  const handleHideColumn = () => {
    column.toggleVisibility(false);
    setDataTablePreferences(tableKey, undefined, { [column.id]: false });
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-6 gap-1 px-2 font-mono text-[10.5px]/[14px] font-medium uppercase tracking-[0.07em] text-current data-[state=open]:bg-hover"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="h-3 w-3" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="h-3 w-3" />
            ) : (
              <ChevronUpDownIcon className="h-3 w-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSorting(false)}>
            <ArrowUpIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSorting(true)}>
            <ArrowDownIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Desc
          </DropdownMenuItem>
          {enableHiding && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleHideColumn}>
                <EyeSlashIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
