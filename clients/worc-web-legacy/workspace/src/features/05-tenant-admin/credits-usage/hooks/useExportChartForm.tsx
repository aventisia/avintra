import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { startOfDay, subDays } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { exportCreditUsageCSV } from "../apis/export-service-apis";
import { exportChartZodSchema } from "../constants/export-chart-zod-schema";
import { useExportDialogStore } from "../store/export-dialog-store";

export const useExportChartForm = () => {
  const { toggleFormDirty } = useExportDialogStore();
  const form = useForm<z.infer<typeof exportChartZodSchema>>({
    resolver: zodResolver(exportChartZodSchema),
    defaultValues: {
      serviceType: [],
      agents: [],
      users: [],
      startDate: startOfDay(subDays(new Date(), 7)), // 7 days ago, at start of the day (midnight)
      endDate: new Date(), // Current date
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

  const { isPending, mutateAsync: mutateExportChartCSV } = useMutation({
    mutationFn: exportCreditUsageCSV,
    onSuccess: (blob) => {
      const filename = "credit-usage.csv"; // static filename
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("CSV successfully exported.");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return {
    isSubmitting,
    isDirty,
    control,
    form,
    mutateExportChartCSV,
    isPending,
  };
};
