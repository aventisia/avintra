import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { Download } from "lucide-react";

import { useExportFlow } from "../../hooks/useExportFlow.hook";

type FlowRowExportActionProps = {
  rowId: string;
};

export const FlowRowExportAction = ({ rowId }: FlowRowExportActionProps) => {
  const { exportFlow, isExporting } = useExportFlow(rowId);

  return (
    <SimpleDDMenuItem
      content="Export"
      Icon={Download}
      onClick={exportFlow}
      disabled={isExporting}
    />
  );
};
