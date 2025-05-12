import FileUploader from "@/features/file-uploader/components/FileUploader";
import InformationExtractor from "@/features/information-extractor/components";
import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";
import MultiFormatViewer from "@/features/multi-format-viewer/MultiFormatViewer";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useLabelDataStore } from "../stores/label-data-store";
import Nav from "./Header/Nav";

export const LabelDataContainer = () => {
  useLabelDataQueryKey();

  // Get model data store state and actions
  const { step, setStepState } = useLabelDataStore(
    useShallow((state) => ({
      step: state.step,
      setStepState: state.setStepState,
    })),
  );

  const { data: pdfList, refetch, isLoading } = useFetchUploadedFiles();

  useEffect(() => {
    if (pdfList?.data.length) {
      setStepState(1);
    } else {
      setStepState(0);
    }
  }, [pdfList, setStepState]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[--icon-color]" />
        <span> Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Nav isPdfAvailable={!!pdfList?.data.length} refetchList={refetch} />

      {step == 1 ? (
        // <div className="grid w-full grid-cols-3">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70} minSize={35}>
            <MultiFormatViewer />
          </ResizablePanel>
          <ResizableHandle withHandle className="ml-2 mr-0" />
          <ResizablePanel defaultSize={35} minSize={35}>
            <InformationExtractor />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // </div>
        <FileUploader />
      )}
    </>
  );
};
