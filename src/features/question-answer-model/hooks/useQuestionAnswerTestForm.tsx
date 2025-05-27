import { updateExtractedData } from "@/apis/extracted-data-api";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { questionAnswerTestFormZodSchema } from "../constants/question-answer-test-form-zod-schema";
import { QuestionAnswersSetupDTO } from "../dtos/question-answer-setup-dto";

export const useQuestionAnswersTestForm = () => {
  const form = useForm<z.infer<typeof questionAnswerTestFormZodSchema>>({
    resolver: zodResolver(questionAnswerTestFormZodSchema),
    defaultValues: {
      questionAnswers: [],
      submitForFineTuning: false,
    },
  });

  const { control } = form;
  const { extractedData } = useExtractedDataStore(
    useShallow((state) => ({
      extractedData: state.extractedData,
    })),
  );

  const { fields: questionAnswerFields } = useFieldArray({
    control,
    name: "questionAnswers",
  });

  const queryClient = useQueryClient();

  const initializeFieldNames = useCallback(async () => {
    const data = queryClient.getQueryData<{ data: QuestionAnswersSetupDTO }>([
      "QUESTION_ANSWER_SETUP_FORM_DATA",
    ]);
    const setupFormData = data?.data.setupObject;

    const questionAnswers = setupFormData?.questionAnswers?.map((quesAns) => ({
      question: quesAns?.name ?? "",
      answer: "",
    })) ?? [{}];

    form.reset({ questionAnswers });
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

    const currentFields = form.getValues("questionAnswers");

    const updatedFields = currentFields.map((field) => {
      const match = finalExtractedData.find(
        (item) => item.question.trim() === (field.question ?? "").trim(),
      );

      return {
        ...field,
        answer: match?.answer ?? "",
      };
    });

    form.reset({ questionAnswers: updatedFields, submitForFineTuning: false });
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
    questionAnswerFields,
    updateExtractedFormData,
    isUpdatePending,
    initializeFieldNames,
  };
};
