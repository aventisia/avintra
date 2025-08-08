import LoaderTemplate from "@/components/templates/LoaderTemplate";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useSourceParam } from "@/features/label-data/hooks/useSourceParam";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { Checkbox, LoadingSpinner, Separator } from "@aventisia/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { Button } from "@aventisia/ui/buttons";
import { CheckboxField, Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { enumToArray } from "@aventisia/ui/utils";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { submitForFineTuningProps } from "../constants/inference-model-test-field-props";
import { inferenceModelTestFormZodSchema } from "../constants/inference-model-test-zod-schema";
import { inferenceTestTaskComponentMap } from "../constants/inference-test-tasks-component";
import { TaskNameEnum } from "../enum/tasks-name-enum";
import { useFetchSetupFormData } from "../hooks/useFetchSetupFormData";
import { useInferenceModelTestForm } from "../hooks/useInferenceModelTestForm";
import { useTasksToExecuteStore } from "../store/tasks-to-execute";

const InferenceModelTestForm = () => {
  const { data: setupFormData, isLoading } = useFetchSetupFormData();
  const modelNames = enumToArray(TaskNameEnum);
  const { toggleTaskId } = useTasksToExecuteStore();
  const { data: fileList } = useFetchUploadedFiles();
  const { selectedFile, setSelectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      setSelectedFile: state.setSelectedFile,
    })),
  );
  const { isFineTuneFlow } = useSourceParam();
  const {
    form,
    isSubmitting,
    isDirty,
    isUpdatePending,
    updateExtractedFormData,
    initializeFieldNames,
  } = useInferenceModelTestForm();
  const { setValue, watch } = form;
  const submitForFinetuningValue = watch("submitForFineTuning");
  const { data: modelData } = useFetchModel();
  const { setExtractedData } = useExtractedDataStore();

  const isLastFile =
    selectedFile?.id === fileList?.data[fileList.data.length - 1]?.id;
  const [userToggled, setUserToggled] = useState<boolean>(false);

  // Update checkbox automatically when form becomes dirty — only if user hasn’t manually toggled
  useEffect(() => {
    if (!userToggled) {
      setValue("submitForFineTuning", isDirty);
    }
  }, [isDirty, userToggled, setValue]);

  // Handler for manual toggle
  const handleToggle = () => {
    setUserToggled(true); // Mark that the user has toggled manually
    setValue("submitForFineTuning", !submitForFinetuningValue, {
      shouldDirty: true,
    });
  };

  if (isLoading) {
    return <LoaderTemplate />;
  }

  const handleNextFile = () => {
    const files = Array.isArray(fileList?.data) ? fileList.data : [];
    if (!files.length || !selectedFile) return;

    const currentIndex = files.findIndex((pdf) => pdf.id === selectedFile.id);
    if (currentIndex < files.length - 1) {
      const nextFile = files[currentIndex + 1];
      setSelectedFile(nextFile);
    }
  };

  // For reference later
  async function submitHandler(
    formData: z.infer<typeof inferenceModelTestFormZodSchema>,
  ) {
    try {
      await updateExtractedFormData({
        id: modelData?.data.id ?? "",
        docId: selectedFile?.id ?? "",
        submitForFineTuning: formData.submitForFineTuning ?? false,
        summarization: formData.summarization ?? null,
        questionAnswer: formData.questionAnswer ?? null,
        extraction: formData.extraction ?? null,
        classification: formData.classification ?? null,
        sentimentAnalytics: formData.sentimentAnalytics ?? null,
      });

      setExtractedData({});
      handleNextFile(); // ✅ Called only on success
      if (!isLastFile) initializeFieldNames();
    } catch {
      // error handled in onError mutation fn
    }
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="mt-4 flex-grow h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="px-4 space-y-4">
            {modelNames.map(({ value, label }, index) => {
              const modelData =
                setupFormData?.data?.[value as keyof typeof setupFormData.data];

              if (modelData) {
                const taskConfig = inferenceTestTaskComponentMap[value];
                if (!taskConfig) return null;

                const { component: Component } = taskConfig;
                return (
                  <Accordion
                    key={`${value}-${index}`}
                    type="single"
                    collapsible
                    className="w-full bg-slate-100 rounded-lg shadow-sm"
                    defaultValue={value} // 👈 this makes it open by default
                  >
                    <AccordionItem
                      value={value}
                      className="border-none text-base"
                    >
                      <AccordionTrigger className="text-base px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => {
                              if (
                                typeof modelData !== "string" &&
                                modelData?.id
                              ) {
                                toggleTaskId(modelData.id, checked === true);
                              }
                            }}
                          />
                          {label}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-4 text-balance px-1">
                        {/* Render the model-specific component or form here */}
                        <Component form={form} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              }

              return null; // skip rendering if model is null
            })}
          </div>
        </FormProvider>
      </ScrollArea>

      {!isFineTuneFlow && (
        <>
          <Separator />
          <div className="flex items-center justify-between gap-2 px-4 py-1 pb-4">
            <div className="flex items-center gap-1">
              <CheckboxField
                {...submitForFineTuningProps}
                checked={submitForFinetuningValue}
                onCheckedChange={handleToggle}
              />
              <span className="text-sm">Submit for Fine-tuning</span>
            </div>
            <Button
              size="xs"
              type="submit"
              disabled={isSubmitting || isUpdatePending}
            >
              {isUpdatePending ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : isLastFile ? (
                "Save"
              ) : (
                "Save & Next"
              )}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
};

export default InferenceModelTestForm;
