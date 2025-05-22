/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ExtractUpdateRequestDto {
    id: string;
    mlModelId: string;
    docId: string;
    accuracy: number | null;
    type: string;
    submitForFineTuning: boolean;
    dataObject: string;
}
  