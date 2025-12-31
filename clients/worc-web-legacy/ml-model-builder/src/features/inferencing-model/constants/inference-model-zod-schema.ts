import { classificationModelSetupFormZodSchema } from "@/features/classification-model/constants/classification-model-setup-zod-schema";
import { addInfoExtractorFormZodSchema } from "@/features/information-extractor/constants/add-info-extractor-zod-schema";
import { questionAnswerSetupFormZodSchema } from "@/features/question-answer-model/constants/question-answer-setup-zod-schema";
import { sentimentAnalyticsSetupFormZodSchema } from "@/features/sentiment-analytics/constants/setiment-analytics-setup-zod-schema";
import { summarizationModelSetupFormZodSchema } from "@/features/summarization-model/constants/summarization-model-setup-zod-schema";

import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const inferenceModelFormZodSchema = z.object({
  id: z.string().readonly(),
  name: z.string().readonly(),
  businessContext: z.string().min(1, { message: reqError("Business Context") }),
  description: z.string().readonly(),
  extraction: addInfoExtractorFormZodSchema.nullable(),
  summarization: summarizationModelSetupFormZodSchema.nullable(),
  classification: classificationModelSetupFormZodSchema.nullable(),
  sentimentAnalytics: sentimentAnalyticsSetupFormZodSchema.nullable(),
  questionAnswer: questionAnswerSetupFormZodSchema.nullable(),
});
