import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";
import { useLabelDataStore } from "../stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import Nav from "./Header/Nav";
import { PdfPreviewer } from "@/features/pdf-previewer/components/PdfPreviewer";
import AddFields from "@/features/data-fields/components";
import { useEffect } from "react";
import { useFetchUploadedFiles } from "@/features/pdf-previewer/hooks/useFetchFiles";
import FileUploader from "@/features/file-uploader/components/FileUploader";
import { Loader2 } from "lucide-react";

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
        <div className="flex justify-between gap-7">
          <PdfPreviewer />
          <AddFields />
        </div>
      ) : (
        <FileUploader />
      )}
    </>
  );
};
