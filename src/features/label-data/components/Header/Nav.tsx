import { useNavigate } from "react-router-dom";
import { useLabelDataStore } from "../../stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { useFileStore } from "@/features/file-uploader/stores/file-uploader-store";
import { submitFiles } from "@/features/file-uploader/apis/file-upload-apis";
import { useState } from "react";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { AnnotationDataDto } from "../../dtos/annotation-data-dtos";
import { annotationOptimisticMutationFn } from "../../apis/annotation-apis";
import { FileUploadDto } from "@/features/file-uploader/dtos/file-upload-dto";
import TrainingDialog from "../TrainingDialog";
import TrainingDialogTrigger from "../TrainingDialogTrigger";

const Nav = ({
  isPdfAvailable,
  refetchList,
}: {
  isPdfAvailable: boolean;
  refetchList: () => void;
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Get model data store state and actions
  const { modelId, step, modelName, setStepState } = useLabelDataStore(
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
  const { mutate: insertAnnotation } = useListOptimisticMutation<
    AnnotationDataDto,
    AnnotationDataDto | boolean,
    AnnotationDataDto
  >([], annotationOptimisticMutationFn, ["annotations", modelId]);

  const handleFileUpload = async () => {
    if (filesToUpload.length > 0) {
      setIsLoading(true);
      try {
        const res = await submitFiles(filesToUpload);
        const items = res.data;

        await Promise.all(
          items.map((file: FileUploadDto) =>
            insertAnnotation({
              crudAction: "create",
              payload: {
                uploadedDocId: file.id || "",
                mlModelId: modelId,
                annotationObject: "",
              },
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
    <div className="my-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon8"
          onClick={() => {
            navigate("/model-library");
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <p>{modelName || "Model"}</p>
      </div>
      <div className="flex justify-end gap-3">
        {!!step && (
          <Button
            disabled={!step}
            size={"xs"}
            variant="outline"
            onClick={() => setStepState(0)}
          >
            Back
          </Button>
        )}
        {step == 1 ? (
          <TrainingDialog>
            <TrainingDialogTrigger isPdfAvailable={isPdfAvailable} />
          </TrainingDialog>
        ) : (
          <Tooltip
            content={
              isPdfAvailable || filesToUpload.length
                ? "Preview"
                : "Please upload a file to proceed"
            }
          >
            <div>
              <Button
                disabled={
                  isLoading || (!isPdfAvailable && !filesToUpload.length)
                }
                size={"xs"}
                onClick={handleFileUpload}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  " Next"
                )}
              </Button>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default Nav;
