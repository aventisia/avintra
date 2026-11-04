import { deepParse } from "@/features/react-flow/utils/deepParse";
import { useJsonDownload } from "@/hooks/useJSONDowndloader";

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
      detail.flowName ?? "",
    );
  };

  return { exportVersionHistoryFlow };
};
