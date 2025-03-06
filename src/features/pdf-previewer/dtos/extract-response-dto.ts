export interface ExtractResponseDto {
  modelId: string;
  filesExtractedData: IFileExtractedData[];
}

export interface IFileExtractedData {
  fileId: string;
  extractedData: IFieldValueSchema[];
  Remarks: string;
}

export interface IFieldValueSchema {
  fieldName: string;
  fieldValue: string;
}
