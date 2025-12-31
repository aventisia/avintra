import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useOpenModel } from "../../hooks/useOpenModel";

interface ModelRowOpenActionProps {
  rowId: string;
}

export const ModelRowOpenAction = ({ rowId }: ModelRowOpenActionProps) => {
  // Get handle function to open flow
  const handleOpenModelAction = useOpenModel();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenModelAction(rowId, "Label")}
    />
  );
};
