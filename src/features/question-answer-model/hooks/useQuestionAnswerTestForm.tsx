import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { questionAnswerTestFormZodSchema } from "../constants/question-answer-test-form-zod-schema";

export const useQuestionAnswersTestForm = () => {
  const form = useForm<z.infer<typeof questionAnswerTestFormZodSchema>>({
    resolver: zodResolver(questionAnswerTestFormZodSchema),
    defaultValues: {
      questionAnswers: [
        {
          question: "What's a skill you're currently working on developing?",
          answer:
            "My plans for the future include advancing my career and traveling more.",
          accuracy: 85,
        },
        {
          question: "What's a skill you're currently working on developing?",
          answer:
            "My plans for the future include advancing my career and traveling more.",
          accuracy: 75,
        },
        {
          question: "How do you handle conflicts at work?",
          answer:
            "I handle conflicts by staying calm, listening to all parties involved, and finding a fair solution.",
          accuracy: 20,
        },
        {
          question: "What is the most interesting place you have been to?",
          answer:
            "The most interesting place I’ve been to is the Great Wall of China.",
          accuracy: 60,
        },
      ],
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

  return {
    form,
    questionAnswerFields,
    refineFormData,
  };
};
