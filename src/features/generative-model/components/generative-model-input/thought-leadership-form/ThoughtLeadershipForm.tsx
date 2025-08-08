import { submitFiles } from "@/features/file-uploader-setup/apis/file-upload-apis";
import FileUploader from "@/features/file-uploader-setup/components/FileUploader";
import { useFileStore } from "@/features/file-uploader-setup/stores/file-uploader-store";
import {
  dataAndStatsProps,
  documentTypeProps,
  industryProps,
  outputLengthProps,
  outputStructureProps,
  purposeOfArticleProps,
  targetAudienceProps,
  toneAndStyleProps,
  topicProps,
} from "@/features/generative-model/constants/generative-model-field-props/thought-leadership-field-props";
import { thoughtLeadershipZodSchema } from "@/features/generative-model/constants/generative-model-zod-schemas/thought-leadership-zod-schema";
import { useThoughtLeadershipForm } from "@/features/generative-model/hooks/useThoughtLeadershipForm";
import { useUpdateGenerativeModelForm } from "@/features/generative-model/hooks/useUpdateGenerativeModelForm";
import { useToggleFileUploadDialogStore } from "@/features/generative-model/store/toggle-file-upload-store";
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
import { AutosizeTextareaField, Form } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import Documents from "../../documents";
import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";
import GenerativeInputLinks from "../generative-input-links/GenerativeInputLinks";

const ThoughtLeadershipForm = () => {
  const { form, isSubmitting } = useThoughtLeadershipForm();
  const { isUpdatePending, updateFormData } = useUpdateGenerativeModelForm();
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

  async function submitHandler(
    formData: z.infer<typeof thoughtLeadershipZodSchema>,
  ) {
    await updateFormData(formData);
  }

  useEffect(() => {
    if (fileList && fileList.data.length > 0) {
      const setupFormDocuments = fileList.data.map(({ id, name, path }) => {
        return { id: id ?? "", name, instructions: "", path: path ?? "" };
      });
      form.setValue(
        "generativeModel.setupObject.documents",
        setupFormDocuments,
      );
    } else {
      form.setValue("generativeModel.setupObject.documents", []);
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
            <SelectField {...documentTypeProps} />
            <AutosizeTextareaField {...topicProps} />
            <AutosizeTextareaField {...industryProps} />
            <div className="grid grid-cols-2 gap-2 items-center ">
              <SelectField {...purposeOfArticleProps} />
              <SelectField {...toneAndStyleProps} />
            </div>
            <AutosizeTextareaField {...targetAudienceProps} />
            <SelectField {...dataAndStatsProps} />
            <Separator />

            {/* Link */}
            <GenerativeInputLinks form={form} />
            <Separator />

            {/* Documents */}
            <Documents
              form={form}
              name="generativeModel.setupObject.documents"
              label="Documents"
            />
            <Separator />

            <AutosizeTextareaField {...outputLengthProps} />
            <AutosizeTextareaField {...outputStructureProps} />

            <Separator />
            <LLMConfiguration form={form} />
          </div>
        </FormProvider>

        <div className="sticky bottom-0 bg-white">
          <Separator className="h-[0.5px] w-full" />
          <div className="flex items-center justify-end self-end gap-2 px-4 py-3.5">
            <Button
              size="xs"
              type="submit"
              disabled={isSubmitting || isUpdatePending}
              className="min-w-28"
            >
              {isSubmitting || isUpdatePending ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                "Save & Execute"
              )}
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

export default ThoughtLeadershipForm;
