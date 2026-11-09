import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { DownloadSimpleIcon } from "@phosphor-icons/react";

import { useExportFlow } from "../../hooks/useExportFlow.hook";

type FlowRowExportActionProps = {
  rowId: string;
};

export const FlowRowExportAction = ({ rowId }: FlowRowExportActionProps) => {
  const { exportFlow, isExporting } = useExportFlow(rowId);

  return (
    <SimpleDDMenuItem
      content="Export"
      Icon={DownloadSimpleIcon}
      onClick={exportFlow}
      disabled={isExporting}
    />
  );
};
