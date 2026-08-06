export type RequestType = "ServiceRequest" | "ChangeRequest";

export type TicketStatus = "New" | "InProgress" | "Closed";

export type Complexity = "Low" | "Medium" | "High";

export type RiskLevel = "Low" | "Medium" | "High";

export interface TicketCommentDto {
  id?: string;
  ticketId?: string;
  message: string;
  userId?: string;
  userFullName?: string;
  userName?: string;
  avatarSrc?: string;
  initials?: string;
  isEdited?: boolean;
  isDisabled?: boolean;
  createdOn?: string;
  lastModifiedOn?: string;
}

export interface TicketAttachmentDto {
  id?: string;
  ticketId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  extension?: string;
  uploadedByUserId?: string;
  uploadedOn?: string;
}

export interface TicketDto {
  id: string;
  ticketNumber?: string;
  requestType: RequestType;
  title: string;
  description: string;
  requiredBy?: string;
  status?: TicketStatus;
  agentRefId?: string;
  agentName?: string;
  changeSummary?: string;
  changeReason?: string;
  expectedBehavior?: string;
  requestedTimeline?: string;
  complexity?: Complexity;
  estimatedEffortHours?: number;
  estimatedCompletionDate?: string;
  isBillable?: boolean;
  requiresCustomerApproval?: boolean;
  riskLevel?: RiskLevel;
  dependencies?: string;
  triageRemarks?: string;
  commentCount?: number;
  attachmentCount?: number;
  historyCount?: number;
  isDisabled?: boolean;
  createdBy?: string;
  createdOn?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: string;
  comments?: TicketCommentDto[];
  attachments?: TicketAttachmentDto[];
  history?: TicketHistoryDto[];
}

export interface TicketTableDto {
  id: string;
  ticketNumber?: string;
  requestType: RequestType;
  title: string;
  description: string;
  requiredBy?: string;
  status?: TicketStatus;
  agentRefId?: string;
  agentName?: string;
  changeSummary?: string;
  changeReason?: string;
  expectedBehavior?: string;
  requestedTimeline?: string;
  complexity?: Complexity;
  estimatedEffortHours?: number;
  estimatedCompletionDate?: string;
  isBillable?: boolean;
  requiresCustomerApproval?: boolean;
  riskLevel?: RiskLevel;
  dependencies?: string;
  triageRemarks?: string;
  commentCount?: number;
  attachmentCount?: number;
  historyCount?: number;
  isDisabled?: boolean;
  createdBy?: string;
  createdOn?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: string;
}

export interface TicketHistoryDto {
  id: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  changedByUserId: string;
  changedByName?: string;
  changedOn: string;
}

export interface TicketStatusUpdateDto {
  ticketId: string;
  status: TicketStatus;
}

export interface TicketTriageUpdateDto {
  ticketId: string;
  complexity?: Complexity;
  estimatedEffortHours?: number;
  estimatedCompletionDate?: string;
  isBillable?: boolean;
  requiresCustomerApproval?: boolean;
  riskLevel?: RiskLevel;
  dependencies?: string;
  triageRemarks?: string;
}

export interface TenantSupportConfigDto {
  isChangeRequestEnabled: boolean;
}
