/** Column visibility initial state for the projects table. */
export const columnVisibilityState = {
  id: true,
  name: true,
  status: true,
  flowVersionCount: true,
  lastCheckedIn: true,
  environment: false,
  operatingSystem: false,
  osID: false,
  username: false,
  hostname: false,
  isDisabled: false,
  ipAddress: false,
  createdBy: false,
  createdOn: false,
  lastModifiedBy: false,
  lastModifiedOn: false,
};

export const agentSelectTableColumnVisibilityState = {
  id: true,
  name: false,
  versionNumber: true,
  isAssigned: false,
};
