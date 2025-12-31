// inference-task-component-map.ts
import ClassificationModelSetupForm from "@/features/classification-model/components/setup/ClassificationModelSetupForm";
import InformationExtractorForm from "@/features/information-extractor/components/setup/InformationExtractorForm";
import QuestionAnswerSetupForm from "@/features/question-answer-model/components/setup/QuestionAnswerSetupForm";
import SentimentAnalyticsForm from "@/features/sentiment-analytics/components/setup/SentimentAnalyticsForm";
import SummarizationModelSetupForm from "@/features/summarization-model/components/setup/SummarizationModelSetupForm";

import type { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { inferenceModelFormZodSchema } from "./inference-model-zod-schema";

export const inferenceTaskComponentMap: Record<
  string,
  {
    label: string;
    component: FC<{
      form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
    }>;
  }
> = {
  classification: {
    label: "Classification",
    component: ClassificationModelSetupForm,
  },
  extraction: {
    label: "Extraction",
    component: InformationExtractorForm,
  },
  questionAnswer: {
    label: "Question Answer",
    component: QuestionAnswerSetupForm,
  },
  sentimentAnalytics: {
    label: "Sentiment Analytics",
    component: SentimentAnalyticsForm,
  },
  summarization: {
    label: "Summarization",
    component: SummarizationModelSetupForm,
  },
};
