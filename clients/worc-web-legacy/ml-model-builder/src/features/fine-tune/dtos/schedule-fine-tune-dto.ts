export interface ScheduleFineTuneDTO {
  mlModelId: string;
  fileIds: string[];
  timeZone: string;
  scheduledAt: Date;
}
