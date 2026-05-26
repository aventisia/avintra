import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { openAIIntegrationZodSchema } from "../constants/openai-zod-schema";

export const useOpenAIForm = () => {
  const { toggleFormDirty } = useAvailableIntegrationsDialogStore();

  const form = useForm<z.infer<typeof openAIIntegrationZodSchema>>({
    resolver: zodResolver(openAIIntegrationZodSchema),
    defaultValues: {
      id: "",
      apiKey: "",
      baseURL: "",
      organizationId: "",
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
