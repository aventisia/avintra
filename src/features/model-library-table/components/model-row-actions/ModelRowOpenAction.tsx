import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useOpenModelLabelData } from "../../hooks/useOpenModel";

interface ModelRowOpenActionProps {
  rowId: string;
}

export const ModelRowOpenAction = ({ rowId }: ModelRowOpenActionProps) => {
  // Get handle function to open Model
  const handleOpenModelAction = useOpenModelLabelData();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenModelAction(rowId)}
    />
  );
};
