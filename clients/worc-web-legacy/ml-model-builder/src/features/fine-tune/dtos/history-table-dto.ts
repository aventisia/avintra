export interface HistoryTableDTO {
  id: string;
  mlModelId: string;
  version: number;
  status: string;
  scheduledOn: Date | null;
  timeZone: string;
  record: number;
  accuracy: number;
  fineTunedOn: Date | null;
  duration: number | null;
}
