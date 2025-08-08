import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { thoughtLeadershipZodSchema } from "../constants/generative-model-zod-schemas/thought-leadership-zod-schema";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ThoughtLeadershipDTO } from "../dtos/thought-leadership-dto";


export const useThoughtLeadershipForm = () => {
  const { modelId } = useLabelDataStore(
      useShallow((state) => ({
        modelId: state.modelId,
      })),
    );
  const form = useForm<z.infer<typeof thoughtLeadershipZodSchema>>({
    resolver: zodResolver(thoughtLeadershipZodSchema),
    defaultValues: {
      id: modelId ?? "",
      generativeModel: {
        name: "ThoughtLeadership",
        configurationType: "OnPrem",
        llm: "gemma",
        temperature: 0.6,
        nodePrompt: "",
        setupObject: {
          documentType: "",
          topic: "",
          industry: "",
          purpose: "",
          toneStyle: "",
          audienceTarget: "",
          dataAndStats: "",
          links: [{url: ""}],
          documents: null,
          contentLength: "",
          contentStructure: "",
      }
    }
    },
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get models data from query client
    const generativeModelData = queryClient.getQueryData<{
      data: ThoughtLeadershipDTO;
    }>(["GENERATIVE_SETUP_FORM_DATA"]);

    if(generativeModelData?.data?.generativeModel?.name === "ThoughtLeadership") {
        form.reset({
          id: generativeModelData?.data.id ?? modelId ?? "",
          generativeModel: generativeModelData?.data.generativeModel  ?? {
            name: "ThoughtLeadership",
            configurationType: "OnPrem",
            llm: "gemma",
            temperature: 0.6,
            nodePrompt: "",
            setupObject: {
              documentType: "",
              topic: "",
              industry: "",
              purpose: "",
              toneStyle: "",
              audienceTarget: "",
              dataAndStats: "",
              links: [{url: ""}],
              documents: null,
              contentLength: "",
              contentStructure: "",
          }
        }
        })
    }
  }, [form, queryClient, modelId]);

  return {
    form,
    isDirty,
    isSubmitting,
  };
};
