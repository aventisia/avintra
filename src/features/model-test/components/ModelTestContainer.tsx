import FileUploader from "@/features/file-uploader/components/FileUploader";

import { useShallow } from "zustand/react/shallow";

import { useModelTestQueryKey } from "../hooks/useModelTestQueryKey";
import { useModelTestStore } from "../stores/model-test-store";
import { ExtractedDataTable } from "./ExtractedDataTable/ExtractedDataTable";
import Nav from "./Header/Nav";

export const ModelTestContainer = () => {
  useModelTestQueryKey();

  // Get model data store state and actions
  const { step } = useModelTestStore(
    useShallow((state) => ({
      step: state.step,
      setStepState: state.setStepState,
    })),
  );

  return (
    <>
      <Nav isPdfAvailable />
      {step == 0 && <FileUploader />}
      {step == 1 && <ExtractedDataTable />}
    </>
  );
};
