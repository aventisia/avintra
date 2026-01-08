import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants";
import { AvailableCreditDto } from "@/features/available-credits/available-credits-dto";
import { useTasksToExecuteStore } from "@/features/inferencing-model/store/tasks-to-execute";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";
// import { useExtractedDataStore } from "@/store/extract-via-llm-store";
import { useTabStore } from "@/store/tab-store";

// import { formatSeconds } from "@/utils/formatSeconds";

// import { formatSeconds } from "@/utils/formatSeconds";

import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, SparklesIcon, Timer } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFileListStore } from "../../features/multi-format-viewer/store/file-list-store";
import { useExtractViaLLMMutation } from "../../hooks/useExtractViaLLMMutation";

function ExtractViaLLMButton() {
  // Get query client
  const queryClient = useQueryClient();

  // Get modelId from query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("pid") || "";
  const versionID = queryParams.get("v") || "";

  const { selectedPdf } = useFileListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedFile,
    })),
  );
  const { activeTab } = useTabStore();
  const { isLoading: isModelLoading } = useFetchProjectMetaData();
  // const { extractedData } = useExtractedDataStore(
  //   useShallow((state) => ({
  //     extractedData: state.extractedData,
  //   })),
  // );
  const { listOfTasksId } = useTasksToExecuteStore();

  // Get extract via LLM mutation and pending status
  const { extractViaLLMMutation, isExtractionPending, extractionTimeMs } =
    useExtractViaLLMMutation();

  const handleExtract = () => {
    // Fetch available credits from dataquery cache
    const availableCredits = queryClient.getQueryData<{
      data: AvailableCreditDto;
    }>(AC_QUERY_KEY);

    // Check if available credits are more than zero
    if (availableCredits && availableCredits?.data?.availableCredits <= 10) {
      // Show toast notification for insufficient credits
      toast.error("Insufficient credits. Please top up to continue.");
      return;
    }

    extractViaLLMMutation({
      postObj: {
        modelId: modelId,
        aiProjectVersionId: versionID,
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
              {extractionTimeMs ? extractionTimeMs + "s" : "0s"}
            </p>
          </>
        </div>
      </Tooltip>
    </div>
  );
}

export default ExtractViaLLMButton;
