/**
 * Lifecycle status of an agent risk registry record.
 */
export enum RiskLifecycleStatus {
  NotAssessed = "not-assessed",
  InAssessment = "in-assessment",
  Submitted = "submitted",
  InReview = "in-review",
  Approved = "approved",
  ApprovedWithExceptions = "approved-with-exceptions",
  Monitored = "monitored",
  ActionRequired = "action-required",
  Retired = "retired",
}
