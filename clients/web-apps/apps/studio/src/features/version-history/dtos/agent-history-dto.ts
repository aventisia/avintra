export interface FlowVersionHistoryDto {
  id: string;
  flowVersionId: string;
  versionNumber: number;
  flowId: string;
  flowName?: string | null;

  createdBy?: string | null;
  createdByUsername?: string | null;
  createdOn: Date | string;
  createdByUserInitials?: string | null;
}
