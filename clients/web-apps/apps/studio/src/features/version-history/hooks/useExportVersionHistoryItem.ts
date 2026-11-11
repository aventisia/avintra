import { buildFlowExportFileName, deepParse } from "@avplatform/ui/utils";

import { useJsonDownload } from "@/hooks/useJsonDownload.hook";

import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";

export const useExportVersionHistoryItem = () => {
  const { downloadJson } = useJsonDownload();

  const exportVersionHistoryFlow = (detail: FlowVersionHistoryDetailDto) => {
    const reactFlowObject = deepParse(
      detail.reactFlowObject || JSON.stringify({}),
    ) as unknown as Record<string, unknown>;
    const flowVariablesObject = deepParse(detail.flowVariablesObject || JSON.stringify([]));
    const inputOutputObject = deepParse(detail.inputOutputObject || JSON.stringify([]));

    downloadJson(
      { reactFlowObject: { ...reactFlowObject, flowVariablesObject, inputOutputObject } },
      buildFlowExportFileName(detail.flowName, detail.versionNumber),
    );
  };

  return { exportVersionHistoryFlow };
};
