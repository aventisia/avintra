import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";

import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { rescheduleFineTuneFormZodSchema } from "../constants/reschedule-fine-tune-zod-schema";

export const useRescheduleFineTuneForm = () => {
  const { data: modelData } = useFetchModel();

  const form = useForm<z.infer<typeof rescheduleFineTuneFormZodSchema>>({
    resolver: zodResolver(rescheduleFineTuneFormZodSchema),
    defaultValues: {
      mlModelId: "",
      id: "",
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
    formData: z.infer<typeof rescheduleFineTuneFormZodSchema>,
  ) => {
    return { ...formData };
  };

  return { form, rowId, crudAction, refineFormData, setShowDialog };
};
