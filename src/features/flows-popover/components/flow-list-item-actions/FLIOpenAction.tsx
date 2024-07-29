import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/drop-down/SimpleDDMenuItem";
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
    <SimpleDDMenuItem
      size="sm"
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenFlowAction(flowId)}
    />
  );
};
