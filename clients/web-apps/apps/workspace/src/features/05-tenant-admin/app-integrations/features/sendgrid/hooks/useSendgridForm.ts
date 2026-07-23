import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import { sendgridIntegrationZodSchema } from "../constants/sendgrid-zod-schema";

export const useSendgridIntegrationForm = () => {
  const { toggleFormDirty } = useAvailableIntegrationsDialogStore();

  const form = useForm<z.infer<typeof sendgridIntegrationZodSchema>>({
    resolver: zodResolver(sendgridIntegrationZodSchema),
    defaultValues: {
      id: "",
      apiKey: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
  } = form;

  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  return { form, isSubmitting, isDirty, control };
};
