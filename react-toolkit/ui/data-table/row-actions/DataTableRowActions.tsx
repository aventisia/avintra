import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/react-toolkit/ui/dropdown-menu";
import { DropdownMenu } from "@/react-toolkit/ui/dropdown-menu/DropdownMenu";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

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
          "data-[state=open]:bg-muted",
        )}
      >
        <EllipsisHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-[7rem] min-w-[7rem]", className)}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
