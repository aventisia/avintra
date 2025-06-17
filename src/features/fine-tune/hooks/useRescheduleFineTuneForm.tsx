import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";

import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

// import { HISTORY_TABLE_QUERY_KEY } from "../constants";
import { rescheduleFineTuneFormZodSchema } from "../constants/reschedule-fine-tune-zod-schema";
import { HistoryTableDTO } from "../dtos/history-table-dto";
import { useRescheduleFineTuneStore } from "../stores/reschedule-fine-tune-store";

export const useRescheduleFineTuneForm = () => {
  const { data: modelData } = useFetchModel();
  const { id: rowId } = useRescheduleFineTuneStore();
  const queryClient = useQueryClient();

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
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: HistoryTableDTO[];
    }>(["historyRecords"]);

    // Extract setupObject from fetched data
    const currentRowData = data?.data.find((item) => item.id === rowId);

    if (!currentRowData) return;

    form.reset({
      id: currentRowData?.id ?? rowId ?? "",
      scheduledAt: currentRowData?.scheduledOn ?? undefined,
      timeZone: currentRowData?.timeZone ?? "",
    });
  }, [form, queryClient, rowId]);

  useEffect(() => {
    if (modelData?.data.id) {
      form.setValue("mlModelId", modelData.data.id);
    }
  }, [modelData?.data.id, form]);

  const {
    crudDialogOptions: { crudAction },
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

  return { form, crudAction, refineFormData, setShowDialog };
};
