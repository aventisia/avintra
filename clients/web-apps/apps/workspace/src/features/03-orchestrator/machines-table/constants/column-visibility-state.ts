/** Column visibility initial state for the projects table. */
export const columnVisibilityState = {
  selectRow: false,
  name: true,
  status: true,
  flowVersionCount: true,
  lastCheckedIn: true,
  environment: true,
  operatingSystem: true,
  osID: true,
  username: true,
  hostname: true,
  isDisabled: true,
  ipAddress: true,
  createdBy: true,
  createdOn: true,
  lastModifiedBy: true,
  lastModifiedOn: true,
  id: true,
};

export const agentSelectTableColumnVisibilityState = {
  id: true,
  name: false,
  versionNumber: true,
  isAssigned: false,
};
