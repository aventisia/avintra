export interface ExtractRequestDto {
  modelId: string;
  aiProjectVersionId: string;
  fileIds: string[];
  modelTaskIds: string[] | null;
}
