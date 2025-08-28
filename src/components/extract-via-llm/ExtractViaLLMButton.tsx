import { useTasksToExecuteStore } from "@/features/inferencing-model/store/tasks-to-execute";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";
import { useTabStore } from "@/store/tab-store";
import { formatSeconds } from "@/utils/formatSeconds";

// import { formatSeconds } from "@/utils/formatSeconds";

import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { Loader2, SparklesIcon, Timer } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFileListStore } from "../../features/multi-format-viewer/store/file-list-store";
import { useExtractViaLLMMutation } from "../../hooks/useExtractViaLLMMutation";

function ExtractViaLLMButton() {
  // Get modelId from query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("pid") || "";

  const { selectedPdf } = useFileListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedFile,
    })),
  );
  const { activeTab } = useTabStore();
  const { isLoading: isModelLoading } = useFetchModel();
  const { extractedData } = useExtractedDataStore(
    useShallow((state) => ({
      extractedData: state.extractedData,
    })),
  );
  const { listOfTasksId } = useTasksToExecuteStore();

  // Get extract via LLM mutation and pending status
  const { extractViaLLMMutation, isExtractionPending } =
    useExtractViaLLMMutation();

  const handleExtract = () => {
    extractViaLLMMutation({
      postObj: {
        modelId: modelId,
        fileIds: [selectedPdf?.id || ""],
        modelTaskIds: listOfTasksId.length > 0 ? listOfTasksId : null,
      },
    });
  };

  if (activeTab === "setup") {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      <Button
        size="xs"
        className="gap-2 text-sm"
        onClick={handleExtract}
        disabled={isExtractionPending || activeTab == "setup" || isModelLoading}
      >
        {isExtractionPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <SparklesIcon className="ml-1 h-4 w-4" />
            Execute
          </>
        )}
      </Button>
      <Tooltip side="right" content="Last execution time">
        <div className="flex items-center gap-1.5 mr-2">
          <>
            <Timer className="h-4 w-4" />
            <p className="text-sm">
              {extractedData.executionTime
                ? formatSeconds(extractedData.executionTime)
                : "0s"}
            </p>
          </>
        </div>
      </Tooltip>
    </div>
  );
}

export default ExtractViaLLMButton;
