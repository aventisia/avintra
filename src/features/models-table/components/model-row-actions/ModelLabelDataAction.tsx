import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { TagIcon } from "lucide-react";
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
      Icon={TagIcon}
      onClick={() => handleOpenModelAction(rowId, "Label")}
    />
  );
};
