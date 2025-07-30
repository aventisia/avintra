import { submitFiles } from "@/features/file-uploader-setup/apis/file-upload-apis";
import FileUploader from "@/features/file-uploader-setup/components/FileUploader";
import { useFileStore } from "@/features/file-uploader-setup/stores/file-uploader-store";
import {
  documentTitleProps,
  documentTypeProps,
  guidelinesProps,
  localizationNeededProps,
  outputStructureProps,
} from "@/features/generative-model/constants/generative-model-field-props/document-drafting-field-props";
import { documentDraftingZodSchema } from "@/features/generative-model/constants/generative-model-zod-schemas/document-drafting-zod-schema";
import { useDocumentDraftingForm } from "@/features/generative-model/hooks/useDocumentDraftingForm";
import { useToggleFileUploadDialogStore } from "@/features/generative-model/store/toggle-file-upload-store";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { AutosizeTextareaField, Form } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import Documents from "../../documents";
import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";

const DocumentDraftingForm = () => {
  const { form, isSubmitting, refineFormData } = useDocumentDraftingForm();
  const { data: modelData, isLoading } = useFetchModel();
  const { setShowFileUploadDialog, showFileUploadDialog } =
    useToggleFileUploadDialogStore();
  const { filesToUpload, clearFiles } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      clearFiles: state.clearFiles,
    })),
  );
  const [fileInsertLoading, setFileInsertLoading] = useState(false);
  const { data: fileList, refetch } = useFetchUploadedFiles("setup");

  function submitHandler(formData: z.infer<typeof documentDraftingZodSchema>) {
    console.log(refineFormData(formData));
  }

  useEffect(() => {
    if (fileList && fileList.data.length > 0) {
      const setupFormDocuments = fileList.data.map(({ id, name, path }) => {
        return { id: id ?? "", name, instructions: "", filePath: path ?? "" };
      });
      form.setValue("documents", setupFormDocuments);
    }
  }, [fileList, form]);

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
      <Form
        methods={form}
        onSubmit={form.handleSubmit(submitHandler)}
        disabled={isSubmitting || isLoading || modelData?.data.isPublished}
      >
        <FormProvider {...form}>
          <div className="space-y-4 px-4 pb-1 w-full">
            <AutosizeTextareaField {...documentTitleProps} />
            <AutosizeTextareaField {...documentTypeProps} />
            <AutosizeTextareaField {...guidelinesProps} />
            <AutosizeTextareaField {...outputStructureProps} />
            <AutosizeTextareaField {...localizationNeededProps} />
            <Separator />
            <Documents
              form={form}
              name="documents"
              label="Add Reference Documents"
            />
            <Separator />

            <LLMConfiguration form={form} />
          </div>
        </FormProvider>

        <div className="sticky bottom-0 bg-white left-0 right-0 self-end">
          <Separator className="h-[0.5px] w-full" />
          <div className="flex items-center justify-end self-end gap-2 px-4 py-3.5">
            <Button size="xs" type="submit" disabled={isSubmitting}>
              {/* {isSubmitting || isUpdatePending ? (
                    <LoadingSpinner className="h-4 w-4" />
                    ) : (
                      "Save"
                      )} */}
              Save & Execute
            </Button>
          </div>
        </div>
      </Form>

      <Dialog
        open={showFileUploadDialog}
        onOpenChange={setShowFileUploadDialog}
      >
        <DialogContent className="max-w-[50vw]">
          <DialogHeader className="p-4">
            <DialogTitle>Upload Files</DialogTitle>
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

export default DocumentDraftingForm;
