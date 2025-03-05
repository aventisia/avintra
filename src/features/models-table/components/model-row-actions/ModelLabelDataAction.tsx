import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useOpenModel } from "../../hooks/useOpenModel";

interface ModelLabelDataActionProps {
  rowId: string;
}

export const ModelLabelDataAction = ({ rowId }: ModelLabelDataActionProps) => {
  // Get handle function to open Model
  const handleOpenModelAction = useOpenModel();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Label data"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenModelAction(rowId, "Label")}
    />
  );
};
