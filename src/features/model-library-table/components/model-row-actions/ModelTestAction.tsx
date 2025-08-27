import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";

import { useOpenModelTest } from "../../hooks/useOpenModelTest";

interface ModelTestActionProps {
  rowId: string;
}

export const ModelTestAction = ({ rowId }: ModelTestActionProps) => {
  // Get handle function to open Model
  const handleOpenTestAction = useOpenModelTest();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Test"
      Icon={ArrowPathRoundedSquareIcon}
      onClick={() => handleOpenTestAction(rowId)}
    />
  );
};
