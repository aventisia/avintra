/** Column visibility initial state for the tenants table. */
export const columnVisibilityState = {
  id: false,

  // Core
  name: true,
  type: false,
  currency: false,
  resourceType: false,
  activePlan: true,
  // Dates
  effectiveDate: false,
  renewalDate: true,
  expiresOn: false,

  // Business
  domain: false,
  country: false,
  numberOfEmployees: false,
  industry: false,

  // Usage / Metrics
  publishAgent: false,
  totalJobs: false,
  totalUsers: true,
  availableCredits: true,
  consumedCredits: true,
  totalExecutionTime: true,
  storageSize: false,

  // Flags
  isDisabled: false,

  // Audit
  createdBy: false,
  createdOn: false,
  lastModifiedBy: false,
  lastModifiedOn: false,
};
