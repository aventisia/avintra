import { CrudActionType } from "@/react-toolkit/types";

/**
 * The unique key for the tenants query to be used in the query client. ["tenants"]
 */
const DATA_QUERY_KEY = ["tenants"];

/**
 * The heading for the tenants table.
 */
const TABLE_HEADING = "Tenants";

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
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};
