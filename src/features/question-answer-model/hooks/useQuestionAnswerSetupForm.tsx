/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { questionAnswerSetupFormZodSchema } from "../constants/question-answer-setup-zod-schema";

export const useQuestionAnswerSetupForm = () => {
  const form = useForm<z.infer<typeof questionAnswerSetupFormZodSchema>>({
    resolver: zodResolver(questionAnswerSetupFormZodSchema),
    defaultValues: {
      context: "",
      questions: [{ question: "", instructions: "" }],
      prompt:
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
    name: "questions",
  });

  // Function to add a new object to categories
  const addQuestion = () => {
    append({ question: "", instructions: "" });
  };

  // Function to remove an object from categories
  const removeQuestion = (index: number) => {
    remove(index);
  };

  return {
    form,
    isSubmitting,
    isDirty,
    categoryFields,
    addQuestion,
    removeQuestion,
  };
};
