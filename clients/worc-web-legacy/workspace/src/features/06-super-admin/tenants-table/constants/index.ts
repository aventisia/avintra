import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the tenants query to be used in the query client. ["tenants"]
 */
const DATA_QUERY_KEY = ["tenants"];

/**
 * The heading for the tenants table.
 */
const TABLE_HEADING = "Tenants";

const TABLE_KEY = "tenants";

/**
 * The column used for searching in the tenants.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Tenant", description: "" };
    case "read":
      return { heading: "Tenant", description: "" };
    case "update":
      return { heading: "Edit Tenant", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};
