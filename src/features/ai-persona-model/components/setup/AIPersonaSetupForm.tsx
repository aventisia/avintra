import FileUploader from "@/features/file-uploader-setup/components/FileUploader";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

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
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { aiPersonaSetupFormZodSchema } from "../../constants/ai-persona-setup-zod-schema";
import { AiPersonaSetupDTO } from "../../dtos/ai-persona-setup-dto";
import { useAIPersonaSetupForm } from "../../hooks/useAiPersonaSetupForm";
import { useToggleFileUploadDialogStore } from "../../store/toggle-file-uploader-store";
import BasicInformation from "./BasicInformation";
import CommunicationChannels from "./CommunicationChannels";
import KnowledgeContext from "./KnowledgeContext";
import ModelConfiguration from "./ModelConfiguration";
import PersonaBehavior from "./PersonaBehavior";

const AIPersonaSetupForm = () => {
  const { showFileUploadDialog, setShowFileUploadDialog } =
    useToggleFileUploadDialogStore();

  const {
    form,
    isSubmitting,
    documentFields,
    addDocument,
    removeDocument,
    isUpdatePending,
    updateFormData,
  } = useAIPersonaSetupForm();
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  console.log(form.getValues());

  // Submit handler
  function submitHandler(
    formData: z.infer<typeof aiPersonaSetupFormZodSchema>,
  ) {
    console.log(formData);

    updateFormData({
      setupObject: formData,
      id: modelId,
    } as AiPersonaSetupDTO);
  }

  return (
    <>
      <Form
        methods={form}
        onSubmit={form.handleSubmit(submitHandler)}
        disabled={isSubmitting}
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

              <ModelConfiguration form={form} />

              {/* Separator */}
              <Separator className="!mt-6" />

              <CommunicationChannels />
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
          <div className="p-4">
            <FileUploader side="bottom" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIPersonaSetupForm;
