import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { llmConfigZodSchema } from "../constants/llm-config-zod-schema";
import { useMemo } from "react";
import { providersData } from "../constants/llm-providers";

export const useDefineLLMConfigForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof llmConfigZodSchema>>({
    resolver: zodResolver(llmConfigZodSchema),
    defaultValues: {
      hasOwnApiKey: false,
      credentials: "",
      llmProvider: "",
      model: "",
      temperature: 0.2,
      topP: 0,
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  const hasOwnApiKey = form.watch("hasOwnApiKey");
  const llmProvider = form.watch("llmProvider");

  // Filter providers by availability if BYOK is false
  const visibleProviders = useMemo(() => {
    return hasOwnApiKey
      ? providersData
      : providersData.filter((p) => p.models.some((m) => m.available));
  }, [hasOwnApiKey]);

  // Filter models based on provider and BYOK
  const visibleModels = useMemo(() => {
    return (
      providersData
        .find((p) => p.value === llmProvider)
        ?.models.filter((m) => hasOwnApiKey || m.available) || []
    );
  }, [llmProvider, hasOwnApiKey]);

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    hasOwnApiKey,
    visibleModels,
    visibleProviders,
  };
};
