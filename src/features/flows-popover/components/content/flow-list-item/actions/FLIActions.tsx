import {
  FLIOpenAction,
  flowOptimisticMutationFn,
  FlowsTableDto,
  useFlowsPopoverStore,
} from "@/features/flows-popover";
import {
  buttonVariants,
  AlertDialog as DeleteAlertDialogRoot,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  StopPropagationWrapper
} from "@/react-toolkit/components/ui";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import {
  DTRowDeleteAlert,
  DTViewRowAction,
  DTDeleteRowAction,
  DTEditRowAction,
} from "@/react-toolkit/components/data-table";
import { useShallow } from "zustand/react/shallow";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { cn } from "@/react-toolkit/lib";

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
  // Get flows store state and actions
  const { flowsQueryKey } = useFlowsPopoverStore(
    useShallow((state) => ({
      flowsQueryKey: state.flowsQueryKey,
    })),
  );

  // Get mutation function to delete the flow
  const { mutate: deleteFlow } = useListOptimisticMutation<
    string,
    FlowsTableDto | boolean,
    FlowsTableDto
  >(flowOptimisticMutationFn, flowsQueryKey);

  // Return the component
  return (
    // NOTE: Stop event propagation is required because this component (FLIActions) is going 
    // to be used inside a CommandItem (FlowListItem) which is a clickable element.
    <StopPropagationWrapper>
      {/* Root component for delete alert dialog */}
      <DeleteAlertDialogRoot>
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
            <DTDeleteRowAction
              menuItemClassName="h-7 !px-[0.3rem] text-xs"
              iconClassName="h-3.5 w-3.5"
            />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Content of delete alert dialog  */}
        <DTRowDeleteAlert
          description="This action cannot be undone. Are you sure you want to delete this flow?"
          confirmText="Yes, delete flow"
          rowDeleteMutateFn={() =>
            deleteFlow({
              id: flowId,
              payload: flowId,
              crudAction: "delete",
            })
          }
        />
      </DeleteAlertDialogRoot>
    </StopPropagationWrapper>
  );
};
