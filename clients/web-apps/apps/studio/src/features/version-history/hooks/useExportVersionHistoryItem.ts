import { deepParse } from "@/features/react-flow/utils/deepParse";
import { useJsonDownload } from "@/hooks/useJSONDowndloader";

import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";

export const useExportVersionHistoryItem = () => {
  const { downloadJson } = useJsonDownload();

  const exportVersionHistoryFlow = (detail: FlowVersionHistoryDetailDto) => {
    const reactFlowObject = deepParse(detail.reactFlowObject || JSON.stringify([]));
    const flowVariablesObject = deepParse(detail.flowVariablesObject || JSON.stringify([]));

    downloadJson({ reactFlowObject, flowVariablesObject }, detail.flowName ?? "");
  };

  return { exportVersionHistoryFlow };
};
