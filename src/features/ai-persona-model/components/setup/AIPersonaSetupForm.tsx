import { submitFiles } from "@/features/file-uploader-setup/apis/file-upload-apis";
import FileUploader from "@/features/file-uploader-setup/components/FileUploader";
import { useFileStore } from "@/features/file-uploader-setup/stores/file-uploader-store";
import LLMConfiguration from "@/features/llm-configuration/components/LLMConfiguration";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

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
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { aiPersonaSetupFormZodSchema } from "../../constants/ai-persona-setup-zod-schema";
import { AiPersonaSetupDTO } from "../../dtos/ai-persona-setup-dto";
import { useAIPersonaSetupForm } from "../../hooks/useAiPersonaSetupForm";
import { useToggleFileUploadDialogStore } from "../../store/toggle-file-uploader-store";
import BasicInformation from "./BasicInformation";
import KnowledgeContext from "./KnowledgeContext";
import PersonaBehavior from "./PersonaBehavior";
import SpeechConfiguration from "./SpeechConfiguration";

const AIPersonaSetupForm = () => {
  const { showFileUploadDialog, setShowFileUploadDialog } =
    useToggleFileUploadDialogStore();
  const { data: fileList, refetch } = useFetchUploadedFiles("setup");
  const { filesToUpload, clearFiles } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      clearFiles: state.clearFiles,
    })),
  );
  const [fileInsertLoading, setFileInsertLoading] = useState(false);
  const { data: modelData, isLoading } = useFetchProjectMetaData();

  const {
    form,
    isSubmitting,
    documentFields,
    addDocument,
    removeDocument,
    isUpdatePending,
    updateFormData,
    refineFormData,
  } = useAIPersonaSetupForm();

  // Submit handler
  function submitHandler(
    formData: z.infer<typeof aiPersonaSetupFormZodSchema>,
  ) {
    updateFormData(refineFormData(formData) as AiPersonaSetupDTO);
  }

  useEffect(() => {
    if (fileList && fileList.data.length > 0) {
      const currentDocs =
        form.getValues("aiPersona.setupObject.documents") || [];
      const setupFormDocuments = fileList.data.map(({ id, name, path }) => {
        const existing = currentDocs.find((doc) => doc.id === id);
        return {
          id: id ?? "",
          name,
          instructions: existing?.instructions ?? "",
          filePath: path ?? "",
        };
      });
      form.setValue("aiPersona.setupObject.documents", setupFormDocuments);
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
        <ScrollArea className="mt-4 flex-grow h-[calc(100vh-14.2rem)]">
          <FormProvider {...form}>
            <div className="space-y-4 px-4 pb-1 w-full">
              {/* Basic Information */}
              <BasicInformation />

              {/* Separator */}
              <Separator />

              {/* Persona Behaviour */}
              <PersonaBehavior />

              {/* Separator */}
              <Separator />

              {/* Knowledge Context */}
              <KnowledgeContext
                addCategory={addDocument}
                categoryFields={documentFields}
                form={form}
                removeCategory={removeDocument}
              />

              {/* Separator */}
              <Separator />

              <LLMConfiguration
                form={form}
                modelType="aiPersona"
                className="bg-transparent"
              />

              {/* Separator */}
              <Separator className="!mt-6" />

              <SpeechConfiguration form={form} />
            </div>
          </FormProvider>
        </ScrollArea>

        <Separator className="my-0 h-[0.5px] w-full" />
        <div className="flex items-center justify-end self-end gap-2 px-4 py-1 pb-4">
          <Button
            size="xs"
            type="submit"
            disabled={isSubmitting || isUpdatePending}
          >
            {isSubmitting || isUpdatePending ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </Form>
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

export default AIPersonaSetupForm;
