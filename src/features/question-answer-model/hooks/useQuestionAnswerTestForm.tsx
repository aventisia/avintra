import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

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

  const { fields: questionAnswerFields } = useFieldArray({
    control,
    name: "questionAnswers",
  });
  const refineFormData = (
    formData: z.infer<typeof questionAnswerTestFormZodSchema>,
  ) => {
    return formData;
  };

  const queryClient = useQueryClient();
  useEffect(() => {
    const data = queryClient.getQueryData<{
      data: QuestionAnswersSetupDTO;
    }>(["QUESTION_ANSWER_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    // Only extract `name` field from fieldSetups
    const questionAnswers = setupFormData?.questionAnswers?.map((quesAns) => ({
      name: quesAns?.name ?? "",
      instructions: quesAns?.instructions ?? "",
      accuracy: 0,
    })) ?? [{}];

    form.reset({
      questionAnswers,
    });
  }, [form, queryClient]);

  return {
    form,
    questionAnswerFields,
    refineFormData,
  };
};
