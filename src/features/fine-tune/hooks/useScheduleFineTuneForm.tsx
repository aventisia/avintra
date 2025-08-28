import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { scheduleFineTuneFormZodSchema } from "../constants/schedule-fine-tune-zod-schema";
import { useScheduleFineTuneStore } from "../stores/schedule-fine-tune-store";

export const useScheduleFineTuneForm = () => {
  const { data: modelData } = useFetchProjectMetaData();
  const { fileIds } = useScheduleFineTuneStore();

  const form = useForm<z.infer<typeof scheduleFineTuneFormZodSchema>>({
    resolver: zodResolver(scheduleFineTuneFormZodSchema),
    defaultValues: {
      mlModelId: "",
      fileIds: [],
      timeZone: "",
      scheduledAt: undefined,
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
    formData: z.infer<typeof scheduleFineTuneFormZodSchema>,
  ) => {
    return { ...formData, fileIds };
  };

  return { form, rowId, crudAction, refineFormData, setShowDialog };
};
