import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useOpenModelLabelData } from "../../hooks/useOpenModelLabelData";

interface ModelLabelDataActionProps {
  rowId: string;
}

export const ModelLabelDataAction = ({ rowId }: ModelLabelDataActionProps) => {
  // Get handle function to open Model
  const handleLabelDataAction = useOpenModelLabelData();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Label data"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleLabelDataAction(rowId)}
    />
  );
};
