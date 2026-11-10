import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

interface FlowRowOpenActionProps {
  rowId: string;
}

export const FlowRowOpenAction = ({ rowId }: FlowRowOpenActionProps) => {
  // Open flow in studio
  const handleOpenFlowAction = () => {
    window.location.href = `${import.meta.env.VITE_STUDIO_PATH}agent?f=${rowId}`;
  };

  // Return the component
  return (
    <SimpleDDMenuItem content="Open" Icon={ArrowSquareOutIcon} onClick={handleOpenFlowAction} />
  );
};
