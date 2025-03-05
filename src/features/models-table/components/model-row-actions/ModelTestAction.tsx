import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { useOpenModel } from "../../hooks/useOpenModel";

interface ModelTestActionProps {
  rowId: string;
}

export const ModelTestAction = ({ rowId }: ModelTestActionProps) => {
  // Get handle function to open Model
  const handleOpenModelAction = useOpenModel();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Test"
      Icon={ArrowPathRoundedSquareIcon}
      onClick={() => handleOpenModelAction(rowId,"test")}
    />
  );
};
