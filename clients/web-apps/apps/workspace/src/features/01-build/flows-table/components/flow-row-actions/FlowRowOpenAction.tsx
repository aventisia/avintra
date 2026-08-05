import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface FlowRowOpenActionProps {
  rowId: string;
}

export const FlowRowOpenAction = ({ rowId }: FlowRowOpenActionProps) => {
  // Open flow in studio
  const handleOpenFlowAction = () => {
    window.location.href = `${import.meta.env.VITE_STUDIO_PATH}agent?f=${rowId}&return=1`;
  };

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={handleOpenFlowAction}
    />
  );
};
