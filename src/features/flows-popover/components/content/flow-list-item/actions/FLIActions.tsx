import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DTEditRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTEditRowAction";
import { DTViewRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTViewRowAction";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/react-toolkit/ui/dropdown-menu";
import { StopPropagationWrapper } from "@/react-toolkit/ui/StopPropagationWrapper";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { FLIDeleteAction } from "./FLIDeleteAction";
import { FLIOpenAction } from "./FLIOpenAction";

interface FLIActionsProps {
  /** The ID of the row */
  flowId: string;
}

/**
 * Renders the actions for a flow list item in the flows list.
 *
 * @param {FlowsTableRowActionsProps} props - The component props.
 * @returns {JSX.Element} The rendered row actions component for flows list.
 */
export const FLIActions = ({ flowId }: FLIActionsProps) => {
  // Return the component
  return (
    // NOTE: Stop event propagation is required because this component (FLIActions) is going
    // to be used inside a CommandItem (FlowListItem) which is a clickable element.
    <StopPropagationWrapper>
      {/* Dropdown menu for flow table row action */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon7" }),
            "hover:bg-slate-200",
            //"opacity-0 group-hover/CommandItem:opacity-100 group-data-[selected]/CommandItem:opacity-100",
            "data-[state=open]:bg-slate-200 data-[state=open]:opacity-100",
          )}
        >
          <EllipsisHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[6rem] min-w-[6rem]">
          {/* To open flow in studio */}
          <FLIOpenAction flowId={flowId} />

          {/* Opens crud dialog to view the flow details */}
          <DTViewRowAction
            rowId={flowId}
            menuItemClassName="h-7 !px-[0.3rem] text-xs"
            iconClassName="h-3.5 w-3.5"
          />

          {/* Opens crud dialog to update flow details */}
          <DTEditRowAction
            rowId={flowId}
            menuItemClassName="h-7 !px-[0.3rem] text-xs"
            iconClassName="h-3.5 w-3.5"
          />

          {/* DropdownMenuSeparator component */}
          <DropdownMenuSeparator />

          {/* Triggers Flow delete alert dialog  */}
          <FLIDeleteAction flowId={flowId} />
        </DropdownMenuContent>
      </DropdownMenu>
    </StopPropagationWrapper>
  );
};
