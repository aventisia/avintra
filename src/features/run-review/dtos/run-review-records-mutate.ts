interface IScheduledInfo {
  scheduledAt?: string;
  timezone?: string;
}

export interface RunReviewRecordsMutatedDTO {
  id?: string;
  mlModelId: string;
  fileIds: string[];
  scheduleInfo: IScheduledInfo | null;
}
