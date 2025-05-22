import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

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
  useEffect(() => {
    const data = queryClient.getQueryData<{
      data: SentimentAnalyticsSetupDTO;
    }>(["SENTIMENT_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    // Only extract `name` field from fieldSetups
    const categories = setupFormData?.categories?.map((category) => ({
      name: category?.name ?? "",
      checked: false,
    })) ?? [{}];

    form.reset({
      categories,
    });
  }, [form, queryClient]);

  return {
    form,
    categoryFields,
    refineFormData,
  };
};
