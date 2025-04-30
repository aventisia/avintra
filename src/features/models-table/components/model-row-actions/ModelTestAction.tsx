import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";

import { CheckCheckIcon } from "lucide-react";

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
      content="Run tests"
      Icon={CheckCheckIcon}
      onClick={() => handleOpenModelAction(rowId, "Test")}
    />
  );
};
