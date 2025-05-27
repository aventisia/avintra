/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { updateSentimentAnalyticsSetupFormData } from "../apis/sentiment-analytics-setup-form-apis";
import { sentimentAnalyticsSetupFormZodSchema } from "../constants/setiment-analytics-setup-zod-schema";
import { SentimentAnalyticsSetupDTO } from "../dtos/sentiment-analytics-setup-dto";

export const useSentimentAnalyticsSetupForm = () => {
  const form = useForm<z.infer<typeof sentimentAnalyticsSetupFormZodSchema>>({
    resolver: zodResolver(sentimentAnalyticsSetupFormZodSchema),
    defaultValues: {
      context: "",
      categories: [{ name: "", instructions: "" }],
      prompt: `You are a sentiment analysis assistant. Your task is to evaluate the emotional tone of the provided text and classify its overall sentiment into one of the predefined categories.\nAnalyse the text based on the language, tone, and implied emotion, not just the presence of specific keywords.\nReturn only the sentiment label as the output. If the sentiment is ambiguous or mixed, return "Neutral".`,
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
  } = form;

  // useFieldArray for handling the dynamic array of categories
  const {
    fields: categoryFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "categories",
  });

  // Function to add a new object to categories
  const addCategory = () => {
    append({ name: "", instructions: "" });
  };

  // Function to remove an object from categories
  const removeCategory = (index: number) => {
    remove(index);
  };

  const queryClient = useQueryClient();
  // Get Setup Form Data

  useEffect(() => {
    const data = queryClient.getQueryData<{
      data: SentimentAnalyticsSetupDTO;
    }>(["SENTIMENT_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    form.reset({
      context: setupFormData?.context ?? "",
      prompt: setupFormData?.prompt || form.getValues("prompt"),
      categories: setupFormData?.categories ?? [{ name: "", instructions: "" }],
    });
  }, [form, queryClient]);

  // Mutation to update form data
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateSentimentAnalyticsSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["SENTIMENT_SETUP_FORM_DATA"],
      });
      queryClient.invalidateQueries({
        queryKey: ["model", modelId],
      });
    },
    onError: (error) => {
      console.error("Error updating data:", error);
      toast.error("Failed to update form data");
    },
  });

  return {
    form,
    isSubmitting,
    isDirty,
    categoryFields,
    addCategory,
    removeCategory,
    updateFormData,
    isUpdatePending,
  };
};
