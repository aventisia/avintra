import { submitFiles } from "@/features/file-uploader/apis/file-upload-apis";
import { FileUploadDto } from "@/features/file-uploader/dtos/file-upload-dto";
import { useFileStore } from "@/features/file-uploader/stores/file-uploader-store";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useInsertAnnotation } from "../../hooks/useInsertAnnotation";
import { useLabelDataStore } from "../../stores/label-data-store";
import TrainingDialog from "../TrainingDialog";
import TrainingDialogTrigger from "../TrainingDialogTrigger";

const Nav = ({
  isPdfAvailable,
  refetchList,
}: {
  isPdfAvailable: boolean;
  refetchList: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get model data store state and actions
  const { modelId, step, setStepState } = useLabelDataStore(
    useShallow((state) => ({
      step: state.step,
      modelName: state.modelName,
      modelId: state.modelId,
      setStepState: state.setStepState,
    })),
  );
  const { filesToUpload, clearFiles } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      clearFiles: state.clearFiles,
    })),
  );
  const { mutate: insertAnnotation } = useInsertAnnotation();

  const handleFileUpload = async () => {
    if (filesToUpload.length > 0) {
      setIsLoading(true);
      try {
        const res = await submitFiles(filesToUpload);
        const items = res.data;

        await Promise.all(
          items.map((file: FileUploadDto) =>
            insertAnnotation({
              uploadedDocId: file.id || "",
              mlModelId: modelId,
              annotationObject: "",
            }),
          ),
        );
      } catch (error) {
        console.error("Error fetching data or mutating:", error);
      }
      clearFiles();
      refetchList();
      setIsLoading(false);

      setStepState(1);
    } else setStepState(1);
  };

  return (
    <div className="fixed left-0 right-0 top-1/2 z-10 flex -translate-y-1/2 justify-between gap-3 p-2">
      {!!step && (
        <Tooltip content="Back" side="right">
          <Button
            disabled={!step}
            size={"xs"}
            variant="secondary"
            onClick={() => setStepState(0)}
            className="group -ml-[4rem] h-[5rem] w-[5rem] justify-end rounded-full opacity-40 hover:-ml-[3.2rem] hover:opacity-100"
          >
            <ArrowLeftIcon className="-mr-1.5 flex h-4 w-4 items-center group-hover:-mr-1 group-hover:h-6 group-hover:w-6" />
          </Button>
        </Tooltip>
      )}
      {step == 1 ? (
        <TrainingDialog>
          <TrainingDialogTrigger isPdfAvailable={isPdfAvailable} />
        </TrainingDialog>
      ) : (
        <>
          <div></div>
          <Tooltip
            content={
              isPdfAvailable || filesToUpload.length
                ? "Next"
                : "Please upload a file to proceed"
            }
            side="left"
          >
            <Button
              disabled={isLoading || (!isPdfAvailable && !filesToUpload.length)}
              size={"xs"}
              onClick={handleFileUpload}
              className="group -mr-[4rem] h-[5rem] w-[5rem] justify-start rounded-full opacity-40 shadow hover:-mr-[3.2rem] hover:opacity-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightIcon className="-ml-1.5 flex h-4 w-4 items-center group-hover:-ml-1 group-hover:h-6 group-hover:w-6" />
              )}
            </Button>
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default Nav;
