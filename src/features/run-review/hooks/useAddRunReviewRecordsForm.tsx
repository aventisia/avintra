import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { addRecordsFormZodSchema } from "../constants/add-records-zod-schema";
import { RunReviewRecordsMutatedDTO } from "../dtos/run-review-records-mutate";

export const useAddRunReviewRecordsTestForm = () => {
  const { data: modelData } = useFetchProjectMetaData();

  const form = useForm<z.infer<typeof addRecordsFormZodSchema>>({
    resolver: zodResolver(addRecordsFormZodSchema),
    defaultValues: {
      fileIds: [],
      scheduleInfo: null,
      mlModelId: "",
    },
  });

  useEffect(() => {
    if (modelData?.data.id) {
      form.setValue("mlModelId", modelData.data.id);
    }
  }, [modelData?.data.id, form]);

  const {
    crudDialogOptions: { rowId, crudAction },
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // ✅ Utility to transform the formData and fileIds into the proper DTO
  const refineFormData = (
    formData: z.infer<typeof addRecordsFormZodSchema>,
    uploadedFileIds: string[],
  ): Omit<RunReviewRecordsMutatedDTO, "id"> => {
    const { scheduleInfo, ...rest } = formData;

    const hasCompleteScheduleInfo =
      scheduleInfo?.timezone && scheduleInfo?.scheduledAt instanceof Date;

    return {
      ...rest,
      fileIds: uploadedFileIds,
      scheduleInfo: hasCompleteScheduleInfo
        ? {
            scheduledAt: (scheduleInfo!.scheduledAt as Date).toISOString(),
            timezone: scheduleInfo!.timezone as string,
          }
        : null,
    };
  };

  return { form, rowId, crudAction, refineFormData, setShowDialog };
};
