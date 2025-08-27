import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { rfpRpiResponseGeneratorZodSchema } from "../constants/generative-model-zod-schemas/rfp-rpi-response-generator-zod-schema";
import { RfpRpiResponseGeneratorDTO } from "../dtos/rfp-rpi-response-generator-dto";

export const useRfpRpiResponseGeneratorForm = () => {
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const form = useForm<z.infer<typeof rfpRpiResponseGeneratorZodSchema>>({
    resolver: zodResolver(rfpRpiResponseGeneratorZodSchema),
    defaultValues: {
      id: modelId ?? "",
      generativeModel: {
        name: "RFPResponseGenerator",
        configurationType: "OnPrem",
        llm: "gemma",
        nodePrompt: "",
        temperature: 0.6,
        setupObject: {
          clientName: "",
          websiteLink: "",
          rpfDocument: null,
          responseStrategy: "",
          responseBoundary: "",
          links: [{ url: "" }],
          preferDocument: null,
        },
      },
    },
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get models data from query client
    const generativeModelData = queryClient.getQueryData<{
      data: RfpRpiResponseGeneratorDTO;
    }>(["GENERATIVE_SETUP_FORM_DATA"]);

    if (
      generativeModelData?.data?.generativeModel?.name ===
      "RFPResponseGenerator"
    ) {
      form.reset({
        id: generativeModelData?.data.id ?? modelId ?? "",
        generativeModel: generativeModelData?.data.generativeModel ?? {
          name: "RFPResponseGenerator",
          configurationType: "OnPrem",
          llm: "gemma",
          temperature: 0.6,
          nodePrompt: "",
          setupObject: {
            clientName: "",
            websiteLink: "",
            rpfDocument: null,
            responseStrategy: "",
            responseBoundary: "",
            links: [{ url: "" }],
            preferDocument: null,
          },
        },
      });
    }
  }, [form, queryClient, modelId]);

  return {
    form,
    isDirty,
    isSubmitting,
  };
};
