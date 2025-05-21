import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";

import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { CheckboxField, Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { submitForFineTuningProps } from "../../constants/sentiment-analytics-test-form-field-props";
import { sentimentalAnalyticsTestFormZodSchema } from "../../constants/sentiment-analytics-test-form-zod-schema";
import { useSentimentalAnalyticsTestForm } from "../../hooks/useSentimentAnalyticsTestForm";
import CategoryFields from "./categories";

const SentimentAnalyticsFormTestForm = () => {
  const { form, refineFormData, categoryFields } =
    useSentimentalAnalyticsTestForm();
  const {
    formState: { isSubmitting, isDirty },
    setValue,
    watch,
  } = form;
  const submitForFinetuningValue = watch("submitForFineTuning");
  const { data: fileList } = useFetchUploadedFiles();

  const { selectedFile, setSelectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      setSelectedFile: state.setSelectedFile,
    })),
  );

  const handleNextFile = () => {
    const files = Array.isArray(fileList?.data) ? fileList.data : [];
    if (!files.length || !selectedFile) return;

    const currentIndex = files.findIndex((pdf) => pdf.id === selectedFile.id);
    if (currentIndex < files.length - 1) {
      const nextFile = files[currentIndex + 1];
      setSelectedFile(nextFile);
    }
  };

  function submitHandler(
    formData: z.infer<typeof sentimentalAnalyticsTestFormZodSchema>,
  ) {
    refineFormData(formData);
    console.log(formData);
    handleNextFile();
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
      <ScrollArea className="mt-4 flex-grow  h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="space-y-10 px-4 pb-1">
            <CategoryFields form={form} categoryFields={categoryFields} />
          </div>
        </FormProvider>
      </ScrollArea>

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
        <Button size="xs" type="submit" disabled={!isDirty || isSubmitting}>
          Save & Next
        </Button>
      </div>
    </Form>
  );
};

export default SentimentAnalyticsFormTestForm;
