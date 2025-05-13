import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { sentimentalAnalyticsTestFormZodSchema } from "../constants/sentiment-analytics-test-form-zod-schema";

export const useSentimentalAnalyticsTestForm = () => {
  const form = useForm<z.infer<typeof sentimentalAnalyticsTestFormZodSchema>>({
    resolver: zodResolver(sentimentalAnalyticsTestFormZodSchema),
    defaultValues: {
      categories: [
        {
          fieldName: "Field 1",
          accuracy: 85,
        },
        {
          fieldName: "Field 2",
          accuracy: 75,
        },
        {
          fieldName: "Field 3",
          accuracy: 20,
        },
        {
          fieldName: "Field 4",
          accuracy: 60,
        },
      ],
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

  return {
    form,
    categoryFields,
    refineFormData,
  };
};
