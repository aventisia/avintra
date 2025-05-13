/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { sentimentAnalyticsSetupFormZodSchema } from "../constants/setiment-analytics-setup-zod-schema";

export const useSentimentAnalyticsSetupForm = () => {
  const form = useForm<z.infer<typeof sentimentAnalyticsSetupFormZodSchema>>({
    resolver: zodResolver(sentimentAnalyticsSetupFormZodSchema),
    defaultValues: {
      context: "",
      categories: [{ categoryName: "", instructions: "" }],
      nodePrompt:
        "You are an expert extraction algorithm.\nOnly extract relevant information from the text.\nIf you do not know the value of an attribute asked to extract, you may omit the attribute's value.",
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
    append({ categoryName: "", instructions: "" });
  };

  // Function to remove an object from categories
  const removeCategory = (index: number) => {
    remove(index);
  };

  return {
    form,
    isSubmitting,
    isDirty,
    categoryFields,
    addCategory,
    removeCategory,
  };
};
