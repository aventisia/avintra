import { Button } from "@aventisia/ui/buttons";
import { Loader2, SparklesIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFileListStore } from "../../multi-format-viewer/store/pdf-list-store";
import { useExtractViaLLMMutation } from "../hooks/useExtractViaLLMMutation";

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

  // Get extract via LLM mutation and pending status
  const { extractViaLLMMutation, isExtractionPending } =
    useExtractViaLLMMutation();

  const handleExtract = () => {
    extractViaLLMMutation({
      modelId: modelId,
      fileIds: [selectedPdf?.id || ""],
    });
  };

  return (
    <Button
      size="xs"
      className="gap-2 pl-2 pr-3.5 text-sm"
      onClick={handleExtract}
      disabled={isExtractionPending}
    >
      {isExtractionPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Extracting...
        </>
      ) : (
        <>
          <SparklesIcon className="ml-1 h-4 w-4" />
          Extract
        </>
      )}
    </Button>
  );
}

export default ExtractViaLLMButton;
