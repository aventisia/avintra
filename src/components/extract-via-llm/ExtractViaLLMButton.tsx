import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useTabStore } from "@/store/tab-store";

import { Button } from "@aventisia/ui/buttons";
import { Loader2, SparklesIcon } from "lucide-react";
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
    <Button
      size="xs"
      className="gap-2 pl-2 pr-3.5 text-sm"
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
  );
}

export default ExtractViaLLMButton;
