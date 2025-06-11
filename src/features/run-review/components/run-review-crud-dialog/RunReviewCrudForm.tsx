import { submitFiles } from "@/features/file-uploader-viewer/apis/file-upload-apis";
import FileUploader from "@/features/file-uploader-viewer/components/FileUploader";
import { useFileStore } from "@/features/file-uploader-viewer/stores/file-uploader-store";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { ModelNamesEnum } from "@/features/pdf-previewer/enums/model-name-enum";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { insertRecords } from "../../apis/run-review-table-apis";
import { RUN_REIVEW_TABLE_QUERY_KEY } from "../../constants";
import { addRecordsFormZodSchema } from "../../constants/add-records-zod-schema";
import { RunReviewRecordsMutatedDTO } from "../../dtos/run-review-records-mutate";
import { useAddRunReviewRecordsTestForm } from "../../hooks/useAddRunReviewRecordsForm";
import ScheduleFineTuning from "./ScheduleFineTuning";

const RunReviewCrudForm = () => {
  const { form, refineFormData, setShowDialog } =
    useAddRunReviewRecordsTestForm();

  const { filesToUpload, clearFiles } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      clearFiles: state.clearFiles,
    })),
  );
  const { data: modelData } = useFetchModel();
  const modelName =
    ModelNamesEnum[modelData!.data.type as keyof typeof ModelNamesEnum];

  const queryClient = useQueryClient();

  const { mutate: mutateRecords } = useMutation({
    mutationFn: (formData: RunReviewRecordsMutatedDTO) =>
      insertRecords(formData, modelName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RUN_REIVEW_TABLE_QUERY_KEY });
      clearFiles(); // optional: clear after success
      toast.success("Records added successfully");
      setShowDialog(false); // ✅ close dialog here
    },
    onError: () => {
      toast.error("Error adding record, please try again.");
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function submitHandler(
    formData: z.infer<typeof addRecordsFormZodSchema>,
  ) {
    if (!filesToUpload.length) {
      toast.error("Please upload a file.");
      return;
    }

    try {
      const response = await submitFiles(filesToUpload);
      const uploadedFileIds = response.data.map(
        (file: { id: string }) => file.id,
      );
      const refinedData = refineFormData(formData, uploadedFileIds);
      mutateRecords(refinedData);
    } catch {
      toast.error("Error adding record, please try again.");
    }
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="h-[calc(100vh-9rem)] px-2.5 pb-0 pt-4">
        <FormProvider {...form}>
          <div className="space-y-4 px-4 pb-1">
            <FileUploader side="bottom" />
            <Separator />
            <p className="!mt-4 font-semibold">Schedule Execution</p>
            <ScheduleFineTuning />
          </div>
        </FormProvider>
      </ScrollArea>

      {/* Sticky footer button */}
      <div className="flex w-full  justify-end px-2 pb-4 border-t pt-3 mt-auto bg-white">
        <Button
          size="xs"
          type="submit"
          disabled={isSubmitting}
          className="min-w-[5rem]"
        >
          {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : "Save"}
        </Button>
      </div>
    </Form>
  );
};

export default RunReviewCrudForm;
