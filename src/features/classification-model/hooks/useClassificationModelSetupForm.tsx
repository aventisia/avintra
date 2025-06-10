import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

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
      prompt: `You are a reliable text classification assistant. Your task is to analyse the given input text and accurately classify it into the predefined categories based on its content, tone, and intent.\nIf “multiple classification mode” is True, you may return more than one applicable category label. Otherwise, return only the single most appropriate category\nSelect the category (or categories) strictly based on the information present in the input. Do not infer or guess beyond the given content.`,
      llm: "",
      temperature: 0,
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
      prompt: setupFormData?.prompt || form.getValues("prompt"),
      allowMultipleClasses: setupFormData?.allowMultipleClasses ?? false,
      categories: setupFormData?.categories ?? [{ name: "", instructions: "" }],
      llm: setupFormData?.llm ?? "",
      temperature: setupFormData?.temperature ?? 0,
    });
  }, [form, queryClient]);

  // Mutation to update form data
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateClassificationSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["CLASSIFICATION_SETUP_FORM_DATA"],
      });
      queryClient.invalidateQueries({
        queryKey: ["model", modelId],
      });
      toast.success("Data saved successfully");
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
