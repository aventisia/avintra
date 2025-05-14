import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { classificationModelSetupFormZodSchema } from "../constants/classification-model-setup-zod-schema";

export const useClassificationModelSetupForm = () => {
  const form = useForm<z.infer<typeof classificationModelSetupFormZodSchema>>({
    resolver: zodResolver(classificationModelSetupFormZodSchema),
    defaultValues: {
      context: "",
      categories: [{ categoryName: "", instructions: "" }],
      allowMultipleClasses: false,
      whenNoClearMatch: "",
      systemPrompt: "",
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
