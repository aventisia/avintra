import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the configs query to be used in the query client. ["configs"]
 */
const DATA_QUERY_KEY = ["vault"];

/**
 * The heading for the configs table.
 */
const TABLE_HEADING = "Vault";

const TABLE_KEY = "vault";

/** Page sizes offered by the vault table, unchanged from the legacy table. */
const VAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const VAULT_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
};

const getDialogHeadingDescription = (action: DialogCrudAction) => {
  switch (action) {
    case "create":
      return { heading: "Add credential", description: "" };
    case "read":
      return { heading: "Credential", description: "" };
    case "update":
      return { heading: "Edit credential", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  TABLE_KEY,
  VAULT_INITIAL_STATE,
  VAULT_PAGE_SIZE_OPTIONS,
};
