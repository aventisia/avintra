import { useToggleFileUploadDialogStore } from "@/features/ai-persona-model/store/toggle-file-uploader-store";
import { submitFiles } from "@/features/file-uploader-setup/apis/file-upload-apis";
import FileUploader from "@/features/file-uploader-setup/components/FileUploader";
import { useFileStore } from "@/features/file-uploader-setup/stores/file-uploader-store";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { SelectField } from "@/shared/select-field/SelectField";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { taskProps } from "../../constants/generative-model-field-props.ts/generative-model-field-props";
import { generativeModelInputZodSchema } from "../../constants/model-input-zod-schema";
import { useGenerativeModelInputForm } from "../../hooks/useGenerativeModelInputForm";
import CompanyDeepDives from "./company-deep-dives/CompanyDeepDives";
import DocmentDrafting from "./document-drafting/DocmentDrafting";
import PersonaResearch from "./persona-research/PersonaResearch";
import RfpRpiResponseGenerator from "./rfp-rpi-response-generator/RfpRpiResponseGenerator";
import ThoughtLeadership from "./thought-leadership/ThoughtLeadership";

const ModelInput = () => {
  const { form, isSubmitting } = useGenerativeModelInputForm();
  const { data: modelData, isLoading } = useFetchModel();
  const tasksValue = form.watch("task");
  const { showFileUploadDialog, setShowFileUploadDialog } =
    useToggleFileUploadDialogStore();
  const { filesToUpload, clearFiles } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      clearFiles: state.clearFiles,
    })),
  );
  const [fileInsertLoading, setFileInsertLoading] = useState(false);
  const { data: fileList, refetch } = useFetchUploadedFiles("setup");
  console.log(fileList);

  // Submit handler
  function submitHandler(
    formData: z.infer<typeof generativeModelInputZodSchema>,
  ) {
    console.log(formData);
  }

  const handleInsertFiles = async () => {
    if (filesToUpload.length > 0) {
      setFileInsertLoading(true);
      try {
        await submitFiles(filesToUpload);
        setShowFileUploadDialog(false);
        refetch();
      } catch (error) {
        console.error("Error fetching data or mutating:", error);
      }
      clearFiles();
      // refetchList();
      setFileInsertLoading(false);
    } else {
      toast.error("Please upload a file before submitting.");
    }
  };

  return (
    <>
      <div className="rounded-lg bg-white shadow h-full flex flex-col max-w-screen-lg mx-auto self-center">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <p className="text-base font-medium">Generative Model</p>
        </div>

        <Form
          methods={form}
          onSubmit={form.handleSubmit(submitHandler)}
          disabled={isSubmitting || isLoading || modelData?.data.isPublished}
        >
          <ScrollArea className="mt-4 flex-grow h-[calc(100vh-13.2rem)]">
            <FormProvider {...form}>
              <div className="space-y-4 px-4 pb-1 w-full">
                <SelectField {...taskProps} />
                {tasksValue === "thought-leadership" && (
                  <ThoughtLeadership form={form} />
                )}
                {tasksValue === "company-deep-dives" && (
                  <CompanyDeepDives form={form} />
                )}

                {tasksValue === "persona-research" && (
                  <PersonaResearch form={form} />
                )}

                {tasksValue === "rpf-rfi-response-generator" && (
                  <RfpRpiResponseGenerator form={form} />
                )}

                {tasksValue === "document-drafting" && (
                  <DocmentDrafting form={form} />
                )}
              </div>
            </FormProvider>
          </ScrollArea>

          <Separator className="my-0 h-[0.5px] w-full" />
          <div className="flex items-center justify-end self-end gap-2 px-4 py-1 pb-4">
            <Button size="xs" type="submit" disabled={isSubmitting}>
              {/* {isSubmitting || isUpdatePending ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              "Save"
            )} */}
              Save & Execute
            </Button>
          </div>
        </Form>
      </div>

      <Dialog
        open={showFileUploadDialog}
        onOpenChange={setShowFileUploadDialog}
      >
        <DialogContent className="max-w-[50vw]">
          <DialogHeader className="p-4">
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="p-4 gap-4 flex flex-col">
            <FileUploader side="bottom" />
            {filesToUpload.length > 0 && (
              <Button
                size="xs"
                type="button"
                className="self-end w-20"
                onClick={handleInsertFiles}
              >
                {fileInsertLoading ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModelInput;
