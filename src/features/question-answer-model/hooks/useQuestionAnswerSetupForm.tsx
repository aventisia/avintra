/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { updateQuestionAnswersSetupFormData } from "../apis/question-answer-setup-api";
import { questionAnswerSetupFormZodSchema } from "../constants/question-answer-setup-zod-schema";
import { QuestionAnswersSetupDTO } from "../dtos/question-answer-setup-dto";

export const useQuestionAnswerSetupForm = () => {
  const form = useForm<z.infer<typeof questionAnswerSetupFormZodSchema>>({
    resolver: zodResolver(questionAnswerSetupFormZodSchema),
    defaultValues: {
      context: "",
      questionAnswers: [{ name: "", instructions: "" }],
      prompt: `You are a question answering assistant. Your task is to read the provided context and accurately answer the user’s question based only on the information present in the given text.\nIf the answer is clearly stated, provide a precise and concise response. If the answer is not found or cannot be determined from the context, respond with "Answer not found in the provided content."\nDo not guess or rely on external knowledge. Only use the information provided in the context.`,
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
    name: "questionAnswers",
  });

  // Function to add a new object to categories
  const addQuestion = () => {
    append({ name: "", instructions: "" });
  };

  // Function to remove an object from categories
  const removeQuestion = (index: number) => {
    remove(index);
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: QuestionAnswersSetupDTO;
    }>(["QUESTION_ANSWER_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    form.reset({
      context: setupFormData?.context ?? "",
      prompt: setupFormData?.prompt || form.getValues("prompt"),
      questionAnswers: setupFormData?.questionAnswers ?? [
        { name: "", instructions: "" },
      ],
    });
  }, [form, queryClient]);

  // Mutation to update form data
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateQuestionAnswersSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["QUESTION_ANSWER_SETUP_FORM_DATA"],
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
    addQuestion,
    removeQuestion,
    updateFormData,
    isUpdatePending,
  };
};
