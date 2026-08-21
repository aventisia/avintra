/**
 * A single exception recorded against an approval.
 */
export interface ApprovalExceptionDto {
  /** Short title of the exception. */
  title: string;
  /** Remediation deadline (DD-MM-YYYY). */
  remediationDeadline: string;
}

/**
 * Approval workflow state for an agent risk registry record.
 * The submitter picks the approver by name; the approver approves/rejects or
 * requests changes.
 */
export interface ApprovalStateDto {
  /** Whether an approval has been submitted. */
  isSubmitted: boolean;
  /** The selected approver's user id. */
  requestedToUserId: string;
  /** The selected approver's display name. */
  requestedToName: string;
  /** When the approval was submitted. */
  requestedOn: string;
  /** Current decision: pending / approved / rejected / returned. */
  decision: string;
  /** Who made the decision (display name). */
  decidedBy: string;
  /** When the decision was made. */
  decidedOn: string;
  /** Notes accompanying the decision. */
  decisionNotes: string;
  /** Exceptions allowed with the approval. */
  exceptions: ApprovalExceptionDto[];
}
