/** Column visibility initial state for the projects table. */
export const columnVisibilityState = {
  id: false,
  name: true,
  type: true,
  agentCount: true,
  environment: true,
  status: true,
  hostname: false,
  ipAddress: false,
  lastCheckedIn: true,
  createdBy: false,
  createdOn: false,
};

export const agentSelectTableColumnVisibilityState = {
  id: true,
  name: false,
  versionNumber: true,
  isAssigned: false,
};
