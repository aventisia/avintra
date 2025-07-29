import { InfoExtractorTestDTO } from "@/features/information-extractor/dtos/info-extractor-test-dto";
import { QuestionAnswersTestDTO } from "@/features/question-answer-model/dtos/question-answer-test-dto";
import { SummarizationTestDTO } from "@/features/summarization-model/dtos/summarization-test-dto";

interface IExtractedData {
    id?: string;
    fileId?: string;
    remarks: string;
    tokenCount: number;
    executionCount: number;
    failedCount: number;
    executionTime: number;
    extraction : InfoExtractorTestDTO | null;
    summarization: SummarizationTestDTO | null;
    questionAnswer: QuestionAnswersTestDTO[] | null;
    classification: null;
    sentimentAnalytics: null;

}

export interface ExtractedDataResponseDto {
    modelId: string;
    extractedData: IExtractedData[];
}