import InformationExtractorTestForm from "@/features/information-extractor/components/test/InformationExtractorTestForm";
import ClassificationModelTestForm from "@/features/classification-model/components/test/ClassificationModelTestForm";
import SummarizationModelTestForm from "@/features/summarization-model/components/test/SummarizationModelTestForm";
import QuestionsAnswersTestForm from "@/features/question-answer-model/components/test/QuestionsAnswersTestForm";
import SentimentAnalyticsFormTestForm from "@/features/sentiment-analytics/components/test/SentimentAnalysisTestForm";

import type { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { inferenceModelTestFormZodSchema } from "./inference-model-test-zod-schema";
// import { UseFormReturn } from "react-hook-form";
// import { inferenceModelFormZodSchema } from "./inference-model-zod-schema";
// import { z } from "zod";

export const inferenceTestTaskComponentMap: Record<
  string,
  { label: string; 
    component: FC<{ form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>> }>;
  }
> = {
  classification: {
    label: "Classification",
    component: ClassificationModelTestForm,
  },
  extraction: {
    label: "Extraction",
    component: InformationExtractorTestForm,
  },
  questionAnswer: {
    label: "Question Answer",
    component: QuestionsAnswersTestForm,
  },
  sentimentAnalytics: {
    label: "Sentiment Analytics",
    component: SentimentAnalyticsFormTestForm,
  },
  summarization: {
    label: "Summarization",
    component: SummarizationModelTestForm,
  },
};
