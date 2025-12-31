import { ClassificationTestDTO } from "@/features/classification-model/dtos/classification-model-test-dto";
import { InfoExtractorTestDTO } from "@/features/information-extractor/dtos/info-extractor-test-dto";
import { QuestionAnswersTestDTO } from "@/features/question-answer-model/dtos/question-answer-test-dto";
import { SentimentAnalyticsTestDTO } from "@/features/sentiment-analytics/dtos/sentiment-analytics-test-dto";
import { SummarizationTestDTO } from "@/features/summarization-model/dtos/summarization-test-dto";

interface IModelInfo {
  createdOn?: string;
  createdByUserId?: string;
  lastModifiedByUserId?: string;
  createdBy?: string;
  createdByUsername?: string;
}

export interface InferenceModelTestDTO extends IModelInfo {
  id: string;
  docId: string;
  docName?: string;
  aiProjectVersionId: string;

  extraction: InfoExtractorTestDTO | null;
  classification: ClassificationTestDTO[] | null;
  summarization: SummarizationTestDTO | null;
  sentimentAnalytics: SentimentAnalyticsTestDTO[] | null;
  questionAnswer: QuestionAnswersTestDTO[] | null;

  accuracy?: number | null;
  type?: string;
  submitForFineTuning: boolean;
  tokenCount?: number;
  executionCount?: number;
  failedCount?: number;
  executionTime?: number;
}
