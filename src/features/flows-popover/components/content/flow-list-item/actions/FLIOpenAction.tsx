import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

/**
 * Props for the FLIOpenAction component.
 */
interface FLIOpenActionProps {
  /** The ID of the flow to open. */
  flowId: string;
}

/**
 * Renders a dropdown menu item for opening a flow.
 *
 * @param {FLIOpenActionProps} props - The component props.
 * @param {string} props.flowId - The ID of the row.
 * @returns {JSX.Element} The rendered component.
 */
export const FLIOpenAction = ({ flowId }: FLIOpenActionProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Return the component
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownItem" }),
        "h-7 !px-[0.3rem] text-xs",
      )}
      onClick={() => handleOpenFlowAction(flowId)}
    >
      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-[--icon-color]" />
      Open
    </DropdownMenuItem>
  );
};
