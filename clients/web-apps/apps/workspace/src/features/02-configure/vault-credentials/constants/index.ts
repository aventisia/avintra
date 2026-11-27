import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the configs query to be used in the query client. ["configs"]
 */
const DATA_QUERY_KEY = ["vault"];

/**
 * The query key of the tenant-level credential list, kept outside DATA_QUERY_KEY so space lists never merge it.
 */
const TENANT_DATA_QUERY_KEY = ["tenant-vault-credential"];

/**
 * The query key of the tenant-level credential select options used by the Models dialog.
 */
const TENANT_OPTIONS_QUERY_KEY = ["tenant-vault-credential-options"];

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
  TENANT_DATA_QUERY_KEY,
  TENANT_OPTIONS_QUERY_KEY,
  VAULT_INITIAL_STATE,
  VAULT_PAGE_SIZE_OPTIONS,
};
