import { updateExtractedData } from "@/apis/extracted-data-api";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { sentimentalAnalyticsTestFormZodSchema } from "../constants/sentiment-analytics-test-form-zod-schema";
import { SentimentAnalyticsSetupDTO } from "../dtos/sentiment-analytics-setup-dto";

export const useSentimentalAnalyticsTestForm = () => {
  const form = useForm<z.infer<typeof sentimentalAnalyticsTestFormZodSchema>>({
    resolver: zodResolver(sentimentalAnalyticsTestFormZodSchema),
    defaultValues: {
      categories: [],
      submitForFineTuning: false,
    },
  });

  const { extractedData } = useExtractedDataStore(
    useShallow((state) => ({
      extractedData: state.extractedData,
    })),
  );

  const { control } = form;

  const { fields: categoryFields } = useFieldArray({
    control,
    name: "categories",
  });
  const refineFormData = (
    formData: z.infer<typeof sentimentalAnalyticsTestFormZodSchema>,
  ) => {
    return formData;
  };

  const queryClient = useQueryClient();

  const initializeFieldNames = useCallback(async () => {
    const data = queryClient.getQueryData<{
      data: SentimentAnalyticsSetupDTO;
    }>(["SENTIMENT_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    // Only extract `name` field from fieldSetups
    const categories = setupFormData?.categories?.map((category) => ({
      name: category?.name ?? "",
      value: false,
    })) ?? [{}];

    form.reset({
      categories,
    });
  }, [form, queryClient]);

  useEffect(() => {
    const setupForm = async () => {
      try {
        await initializeFieldNames();
        // await populateFieldValues();
      } catch (error) {
        toast.error(error?.toString());
      }
    };
    setupForm();
  }, [initializeFieldNames]);

  useEffect(() => {
    const finalExtractedData = extractedData.extractedData ?? [];

    if (!Array.isArray(finalExtractedData) || finalExtractedData.length === 0)
      return;

    const currentFields = form.getValues("categories");

    const updatedFields = currentFields.map((field) => {
      const match = finalExtractedData.find(
        (item) => item.name.trim() === (field.name ?? "").trim(),
      );

      return {
        ...field,
        value: match.value === "true",
      };
    });

    form.reset({ categories: updatedFields, submitForFineTuning: false });
  }, [extractedData, form]);

  const { mutateAsync: updateExtractedFormData, isPending: isUpdatePending } =
    useMutation({
      mutationFn: updateExtractedData,
      onError: () => {
        toast.error("Failed to update data.");
      },
    });

  return {
    form,
    categoryFields,
    refineFormData,
    updateExtractedFormData,
    isUpdatePending,
    initializeFieldNames,
  };
};
