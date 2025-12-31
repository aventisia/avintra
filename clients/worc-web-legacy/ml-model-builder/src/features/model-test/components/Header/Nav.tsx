import { submitFiles } from "@/features/file-uploader-viewer/apis/file-upload-apis";

import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTestModelFileStore } from "../../stores/model-test-file-store";
import { useModelTestStore } from "../../stores/model-test-store";

const Nav = ({
  isPdfAvailable,
}: {
  isPdfAvailable: boolean;
  refetchList?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get model data store state and actions
  const { step, setStepState } = useModelTestStore(
    useShallow((state) => ({
      step: state.step,
      modelId: state.modelId,
      setStepState: state.setStepState,
    })),
  );

  const { filesToUpload, clearFiles } = useTestModelFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      clearFiles: state.clearFiles,
    })),
  );

  const handleFileUpload = async () => {
    if (filesToUpload.length > 0) {
      setIsLoading(true);
      try {
        await submitFiles(filesToUpload);
        // const items = res.data;

        // await Promise.all(
        //   items.map((file: FileUploadDto) =>
        //     insertAnnotation({
        //       uploadedDocId: file.id || "",
        //       mlModelId: modelId,
        //       annotationObject: "",
        //     }),
        //   ),
        // );
      } catch (error) {
        console.error("Error fetching data or mutating:", error);
      }
      clearFiles();
      // refetchList();
      setIsLoading(false);

      setStepState(1);
    } else setStepState(1);
  };

  return (
    <div className="h-0">
      {!!step && (
        <div className="fixed left-0 top-1/2 z-10 -translate-y-1/2">
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
        </div>
      )}
      {step == 1 ? (
        <></>
      ) : (
        <>
          <div className="fixed right-0 top-1/2 z-10 -translate-y-1/2">
            <Tooltip
              content={
                isPdfAvailable || filesToUpload.length
                  ? "Test"
                  : "Please upload a file to proceed"
              }
              side="left"
            >
              <Button
                disabled={
                  isLoading || (!isPdfAvailable && !filesToUpload.length)
                }
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
          </div>
        </>
      )}
    </div>
  );
};

export default Nav;
