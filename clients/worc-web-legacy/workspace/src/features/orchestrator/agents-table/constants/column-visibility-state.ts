/** Column visibility initial state for the agents table. */
export const columnVisibilityState = {
  id: false,
  flowId: false,
  name: true,
  type: true,
  createdBy: true,
  createdOn: true,
  versionNumber: true,
  machineCount: true,
  status: true,
};

export const machineSelectTableColumnVisibilityState = {
  id: true,
  name: false,
  versionNumber: true,
  isAssigned: false,
};
