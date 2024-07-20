import { useOpenFlow } from "@/features/flows-table";
import {
  DropdownMenuItem,
  buttonVariants,
} from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

/**
 * Props for the OpenRowAction component.
 */
interface OpenRowActionProps {
  /** The ID of the row to open. */
  rowId: string;
}

/**
 * Renders a dropdown menu item for opening a flow row.
 *
 * @param {OpenRowActionProps} props - The component props.
 * @param {string} props.rowId - The ID of the row.
 * @returns {JSX.Element} The rendered component.
 */
export const FlowOpenRowAction = ({ rowId }: OpenRowActionProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Return the component
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownItem" }), "h-8")}
      onClick={() => handleOpenFlowAction(rowId)}
    >
      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[--icon-color]" />
      Open
    </DropdownMenuItem>
  );
};
