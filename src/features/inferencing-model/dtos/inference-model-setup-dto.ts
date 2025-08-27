import { ClassficationModelSetupDTO } from "@/features/classification-model/dtos/classfication-model-setup-dto";
import { InformationExtractorSetupDTO } from "@/features/information-extractor/dtos/info-extractor-setup-dto";
import { QuestionAnswersSetupDTO } from "@/features/question-answer-model/dtos/question-answer-setup-dto";
import { SentimentAnalyticsSetupDTO } from "@/features/sentiment-analytics/dtos/sentiment-analytics-setup-dto";
import { SummarizationSetupDTO } from "@/features/summarization-model/dtos/summarization-setup-dto";

interface IModelInfo {
  createdOn?: string;
  createdByUserId?: string;
  lastModifiedByUserId?: string;
  createdBy?: string;
  createdByUsername?: string;
}

export interface InferenceModelSetupDTO extends IModelInfo {
  id: string;
  name: string;
  businessContext: string | null;
  description?: string;
  extraction: InformationExtractorSetupDTO | null;
  summarization: SummarizationSetupDTO | null;
  classification: ClassficationModelSetupDTO | null;
  sentimentAnalytics: SentimentAnalyticsSetupDTO | null;
  questionAnswer: QuestionAnswersSetupDTO | null;
}
