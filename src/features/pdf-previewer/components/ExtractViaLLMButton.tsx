import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Loader2, SparklesIcon } from "lucide-react";
import { useExtractViaLLMMutation } from "../hooks/useExtractViaLLMMutation";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { usePdfListStore } from "../stores/pdf-list-store";

function ExtractViaLLMButton() {
  // Get modelId from query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("mid") || "";

  const { selectedPdf } = usePdfListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedPdf,
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
