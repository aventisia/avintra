import { Ellipsis } from "lucide-react";

import { buttonVariants } from "@/ui/components/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { cn } from "@/ui/lib";

interface DataTableRowActionsProps extends React.PropsWithChildren {
  className?: string;
}

export const DataTableRowActions: React.FC<DataTableRowActionsProps> = ({
  children,
  className,
}) => {
  // Return the component
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon8" }),
          "hover:border-primary-100 data-[state=open]:border-primary-100 data-[state=open]:bg-muted",
        )}
      >
        <Ellipsis className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("flex w-fit min-w-28 flex-col", className)}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
