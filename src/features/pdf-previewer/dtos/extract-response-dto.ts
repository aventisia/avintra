export interface ExtractResponseDto {
  modelId: string;
  filesExtractedData: IFileExtractedData[];
}

export interface IFileExtractedData {
  fileId: string;
  extractedData: IFieldValueSchema[];
  Remarks: string;
  tokenCount: number;
  executionCount: number;
  failedCount: number;
  executionTime: number;
}

export interface IFieldValueSchema {
  fieldName: string;
  fieldValue: string;
}