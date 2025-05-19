import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateClassificationSetupFormData } from "../apis/classification-model-setup-apis";
import { classificationModelSetupFormZodSchema } from "../constants/classification-model-setup-zod-schema";
import { ClassficationModelSetupDTO } from "../dtos/classfication-model-setup-dto";

export const useClassificationModelSetupForm = () => {
  const form = useForm<z.infer<typeof classificationModelSetupFormZodSchema>>({
    resolver: zodResolver(classificationModelSetupFormZodSchema),
    defaultValues: {
      context: "",
      categories: [{ name: "", instructions: "" }],
      allowMultipleClasses: false,
      uncertaintyAction: "",
      prompt: "",
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

  useEffect(() => {
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: ClassficationModelSetupDTO;
    }>(["CLASSIFICATION_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    form.reset({
      context: setupFormData?.context ?? "",
      prompt: setupFormData?.prompt ?? "",
      allowMultipleClasses: setupFormData?.allowMultipleClasses ?? false,
      uncertaintyAction: setupFormData?.uncertaintyAction ?? "",
      categories: setupFormData?.categories ?? [{ name: "", instructions: "" }],
    });
  }, [form, queryClient]);

  // Mutation to update form data
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateClassificationSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["CLASSIFICATION_SETUP_FORM_DATA"],
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
