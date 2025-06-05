import { useSourceParam } from "@/features/label-data/hooks/useSourceParam";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { CheckboxField, Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { submitForFineTuningProps } from "../../constants/info-extractor-test-form-field-props";
import { infoExtractorTestFormZodSchema } from "../../constants/info-extractor-test-zod-schema";
import { useAddInformationExtractorTestForm } from "../../hooks/useAddInfoExtractorTestForm";
import { useFetchSetupFormData } from "../../hooks/useFetchSetupFormData";
import DataFields from "./fields";
import ExtractedTablesData from "./tables";

const InformationExtractorTestForm = () => {
  useFetchSetupFormData();

  const {
    form,
    dataFields,
    tableFields,
    handleAddRow,
    handleDeleteRow,
    initializeFieldNames,
    updateExtractedFormData,
    isUpdatePending,
  } = useAddInformationExtractorTestForm();
  const {
    formState: { isSubmitting, isDirty },
    setValue,
    watch,
  } = form;
  const submitForFinetuningValue = watch("submitForFineTuning");
  const { data: fileList } = useFetchUploadedFiles();
  const { isFineTuneFlow } = useSourceParam();

  const { selectedFile, setSelectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      setSelectedFile: state.setSelectedFile,
    })),
  );
  const { setExtractedData } = useExtractedDataStore(
    useShallow((state) => ({
      setExtractedData: state.setExtractedData,
    })),
  );
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  const isLastFile =
    selectedFile?.id === fileList?.data[fileList.data.length - 1].id;
  const handleNextFile = () => {
    const files = Array.isArray(fileList?.data) ? fileList.data : [];
    if (!files.length || !selectedFile) return;

    const currentIndex = files.findIndex((pdf) => pdf.id === selectedFile.id);
    if (currentIndex < files.length - 1) {
      const nextFile = files[currentIndex + 1];
      setSelectedFile(nextFile);
    }
  };

  async function submitHandler(
    formData: z.infer<typeof infoExtractorTestFormZodSchema>,
  ) {
    const { submitForFineTuning, ...dataToSend } = formData;

    try {
      await updateExtractedFormData({
        id: modelId,
        mlModelId: modelId,
        accuracy: null,
        type: "LabelData",
        dataObject: JSON.stringify(dataToSend),
        submitForFineTuning,
        docId: selectedFile?.id ?? "",
      });

      setExtractedData({});
      handleNextFile(); // ✅ Called only on success
      if (!isLastFile) initializeFieldNames();
    } catch {
      // error handled in onError mutation fn
    }
  }

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

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="mt-4 flex-grow h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="space-y-10 px-4 pb-1">
            <DataFields form={form} dataFields={dataFields} />
            {tableFields.length > 0 && (
              <ExtractedTablesData
                form={form}
                handleAddRow={handleAddRow}
                handleDeleteRow={handleDeleteRow}
                tableFields={tableFields}
              />
            )}
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
              {isLastFile ? "Save" : "Save & Next"}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
};

export default InformationExtractorTestForm;
