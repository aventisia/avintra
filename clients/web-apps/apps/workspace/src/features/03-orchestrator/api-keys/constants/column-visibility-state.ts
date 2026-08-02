import { VisibilityState } from "@tanstack/react-table";

const columnVisibilityState: VisibilityState = {
  id: true,
  name: true,
  keyPrefix: true,
  expiresAt: true,
  status: true,
  lastUsedAt: true,
  permissions: true,
  createdBy: true,
  createdOn: true,
  lastModifiedBy: true,
  lastModifiedOn: true,
};

export { columnVisibilityState };
