import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";
import { useLabelDataStore } from "../stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import Nav from "./Header/Nav";
import { PdfPreviewer } from "@/features/pdf-previewer/components/PdfPreviewer";
import AddFields from "@/features/data-fields/components/DataFields";
import { useEffect } from "react";
import { useFetchUploadedFiles } from "@/features/pdf-previewer/hooks/useFetchFiles";
import FileUploader from "@/features/file-uploader/components/FileUploader";

const LabelDataContainer = () => {
  useLabelDataQueryKey();

  // Get model data store state and actions
  const { step, setStepState } = useLabelDataStore(
    useShallow((state) => ({
      step: state.step,
      setStepState: state.setStepState,
    })),
  );

  const { data: pdfList, refetch } = useFetchUploadedFiles();
  useEffect(() => {
    if (pdfList?.data.length) {
      setStepState(1);
    } else {
      setStepState(0);
    }
  }, [pdfList]);
  return (
    <>
      <Nav isPdfAvailable={!!pdfList?.data.length} refetchList={refetch} />
      {step == 0 && <FileUploader />}
      {step == 1 && (
        <div className="flex justify-between gap-7">
          <PdfPreviewer />
          <AddFields />
        </div>
      )}
    </>
  );
};

export default LabelDataContainer;
