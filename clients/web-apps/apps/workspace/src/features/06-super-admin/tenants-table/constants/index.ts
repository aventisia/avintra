import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state.ee";

/**
 * The unique key for the tenants query to be used in the query client. ["tenants"]
 */
const DATA_QUERY_KEY = ["tenants"];

/**
 * The heading for the tenants table.
 */
const TABLE_HEADING = "Tenants";

const TABLE_KEY = "tenants";

/** Page sizes offered by the table, unchanged from the legacy table. */
const TENANTS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

/**
 * Default to sorting by Plan ascending (Pro customers at the top) unless the
 * user has previously saved an explicit sort preference.
 */
const TENANTS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  sorting: [{ id: "activePlan", desc: false }],
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create tenant", description: "" };
    case "read":
      return { heading: "Tenant", description: "" };
    case "update":
      return { heading: "Edit tenant", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  TENANTS_INITIAL_STATE,
  TENANTS_PAGE_SIZE_OPTIONS,
  getDialogHeadingDescription,
};
