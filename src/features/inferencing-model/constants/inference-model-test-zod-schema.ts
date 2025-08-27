import { classificationModelTestFormZodSchema } from "@/features/classification-model/constants/classification-model-test-form-zod-schema";
import { infoExtractorTestFormZodSchema } from "@/features/information-extractor/constants/info-extractor-test-zod-schema";
import { questionAnswerTestFormZodSchema } from "@/features/question-answer-model/constants/question-answer-test-form-zod-schema";
import { sentimentalAnalyticsTestFormZodSchema } from "@/features/sentiment-analytics/constants/sentiment-analytics-test-form-zod-schema";
import { summarizationModelTestFormZodSchema } from "@/features/summarization-model/constants/summarization-model-test-form-zod-schema";

import { z } from "zod";

export const inferenceModelTestFormZodSchema = z.object({
  id: z.string().readonly(),
  submitForFineTuning: z.boolean(),
  extraction: infoExtractorTestFormZodSchema.nullable(),
  summarization: summarizationModelTestFormZodSchema.nullable(),
  classification: classificationModelTestFormZodSchema.nullable(),
  sentimentAnalytics: sentimentalAnalyticsTestFormZodSchema.nullable(),
  questionAnswer: questionAnswerTestFormZodSchema.nullable(),
});
