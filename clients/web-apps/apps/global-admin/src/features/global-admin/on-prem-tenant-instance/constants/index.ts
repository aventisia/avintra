import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state.ee";

const TENANT_INSTANCE_QUERY_KEY = "TENANT_INSTANCE";

const TABLE_HEADING = "On-prem Tenants";

const TABLE_KEY = "onPremTenantInstance";

/** Page sizes offered by the table, unchanged from the legacy table. */
const TENANT_INSTANCE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const TENANT_INSTANCE_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create instance", description: "" };
    case "read":
      return { heading: " Tenant instance", description: "" };
    case "update":
      return { heading: "Edit instance", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  TENANT_INSTANCE_QUERY_KEY,
  TENANT_INSTANCE_INITIAL_STATE,
  TENANT_INSTANCE_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
};
