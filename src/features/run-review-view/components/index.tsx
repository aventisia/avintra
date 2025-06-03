import ClassificationModelTestForm from "@/features/classification-model/components/test/ClassificationModelTestForm";
import InformationExtractorTestForm from "@/features/information-extractor/components/test/InformationExtractorTestForm";
import Nav from "@/features/label-data/components/Header/Nav";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";
import MultiFormatViewer from "@/features/multi-format-viewer/MultiFormatViewer";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import QuestionsAnswersTestForm from "@/features/question-answer-model/components/test/QuestionsAnswersTestForm";
import SentimentAnalyticsFormTestForm from "@/features/sentiment-analytics/components/test/SentimentAnalysisTestForm";
import SummarizationModelTestForm from "@/features/summarization-model/components/test/SummarizationModelTestForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";
import { useTabStore } from "@/store/tab-store";

import { toast } from "@aventisia/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export const RunReviewView = () => {
  useLabelDataQueryKey();
  const { data: pdfList, refetch, isLoading } = useFetchUploadedFiles();
  const { data: modelData, isLoading: isModelDataLoading } = useFetchModel();
  const { setActiveTab } = useTabStore();

  useEffect(() => {
    setActiveTab("test");
  }, [setActiveTab]);

  if (isLoading || isModelDataLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[--icon-color]" />
        <span> Loading...</span>
      </div>
    );
  }

  const renderLLMComponent = () => {
    const modelType = modelData?.data.type?.toLowerCase(); // Convert to lowercase for case insensitivity

    switch (modelType) {
      case "extraction":
        return <InformationExtractorTestForm />;
      case "sentimentanalytics":
        return <SentimentAnalyticsFormTestForm />;
      case "summarization":
        return <SummarizationModelTestForm />;
      case "classification":
        return <ClassificationModelTestForm />;
      case "questionanswer":
        return <QuestionsAnswersTestForm />;
      default:
        // Optionally log an error or return a fallback component
        toast.error(
          `Unknown model type: ${modelType}. Falling back to default.`,
        );
        return <>Failed to open the Model. Please Try again</>; // Default component
    }
  };

  return (
    <>
      <Nav isPdfAvailable={!!pdfList?.data.length} refetchList={refetch} />

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={70} minSize={35}>
          <MultiFormatViewer />
        </ResizablePanel>
        <ResizableHandle withHandle className="ml-2 mr-0" />
        <ResizablePanel defaultSize={35} minSize={35}>
          <div className="ml-2 rounded-lg bg-white shadow h-full flex flex-col">
            <div className="flex items-center gap-2 h-12 border-b px-4 py-2">
              <p className="text-md font-medium">{modelData?.data.type}</p>
            </div>
            {renderLLMComponent()}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};
