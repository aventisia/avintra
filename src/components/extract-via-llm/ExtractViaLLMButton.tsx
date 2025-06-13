import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useTabStore } from "@/store/tab-store";
import { formatSeconds } from "@/utils/formatSeconds";

import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { Loader2, SparklesIcon, Timer } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFileListStore } from "../../features/multi-format-viewer/store/file-list-store";
import { ModelNamesEnum } from "../../features/pdf-previewer/enums/model-name-enum";
import { useExtractViaLLMMutation } from "../../hooks/useExtractViaLLMMutation";

function ExtractViaLLMButton() {
  // Get modelId from query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("mid") || "";

  const { selectedPdf } = useFileListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedFile,
    })),
  );
  const { activeTab } = useTabStore();
  const { data: modelData, isLoading: isModelLoading } = useFetchModel();

  // Get extract via LLM mutation and pending status
  const { extractViaLLMMutation, isExtractionPending } =
    useExtractViaLLMMutation();

  const handleExtract = () => {
    const modelType = modelData?.data.type;
    const modelName =
      modelType && modelType in ModelNamesEnum
        ? ModelNamesEnum[modelType as keyof typeof ModelNamesEnum]
        : "";

    extractViaLLMMutation({
      postObj: {
        modelId: modelId,
        fileIds: [selectedPdf?.id || ""],
      },
      modelType: modelName,
    });
  };

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
      <Tooltip side="right" content="Total execution time">
        <div className="flex items-center gap-0.5 mr-2">
          <>
            <Timer className="h-4 w-4" />
            <p className="text-sm">
              {/* {executionTime ? formatSeconds(executionTime) : "0s"} */}
              {!isModelLoading && modelData?.data.executionTime
                ? formatSeconds(modelData?.data.executionTime)
                : "0s"}
            </p>
          </>
        </div>
      </Tooltip>
    </div>
  );
}

export default ExtractViaLLMButton;
