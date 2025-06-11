/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ExtractUpdateRequestDto {
    id: string;
    mlModelId: string;
    docId: string;
    accuracy: number | null;
    submitForFineTuning: boolean;
    dataObject: string;
}
  