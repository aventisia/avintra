import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useOpenFlow } from "../../hooks/useOpenFlow";

interface FlowRowOpenActionProps {
  rowId: string;
}

export const FlowRowOpenAction = ({ rowId }: FlowRowOpenActionProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenFlowAction(rowId)}
    />
  );
};
