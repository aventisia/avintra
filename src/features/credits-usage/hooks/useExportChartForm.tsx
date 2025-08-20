import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { exportChartZodSchema } from "../constants/export-chart-zod-schema";
import { useExportDialogStore } from "../store/export-dialog-store";

export const useExportChartForm = () => {
  const { toggleFormDirty } = useExportDialogStore();
  const form = useForm<z.infer<typeof exportChartZodSchema>>({
    resolver: zodResolver(exportChartZodSchema),
    defaultValues: {
      agents: [],
      aiModels: [],
      serviceType: "",
      users: [],
      startDate: "",
      endDate: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
  } = form;

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  return { isSubmitting, isDirty, control, form };
};
