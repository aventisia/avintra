import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state.ee";

const ON_PREM_TENANT_QUERY_KEY = ["ON_PREM_TENANT"];

const TABLE_HEADING = "On-prem Tenants";

const TABLE_KEY = "onPremTenant";

/** Page sizes offered by the table, unchanged from the legacy table. */
const ON_PREM_TENANTS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const ON_PREM_TENANTS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create on-prem tenant", description: "" };
    case "read":
      return { heading: "On-prem tenant", description: "" };
    case "update":
      return { heading: "Edit on-prem tenant", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  ON_PREM_TENANT_QUERY_KEY,
  ON_PREM_TENANTS_INITIAL_STATE,
  ON_PREM_TENANTS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
};
