export interface HistoryTableDTO  {
    id: string;
    docId: string;
    mlModelId: string;
    docName: string;
    status: string;
    fineTunedOn: Date | null;
    duration: number | null;
}