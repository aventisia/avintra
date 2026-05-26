import { CrudActionType } from "@aventisia/ui/types";

const TENANT_INSTANCE_QUERY_KEY = "TENANT_INSTANCE";

const TABLE_HEADING = "On-prem Tenants";

const TABLE_KEY = "onPremTenantInstance";

/**
 * The column used for searching in the tenants.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Instance", description: "" };
    case "read":
      return { heading: " Tenant Instance", description: "" };
    case "update":
      return { heading: "Edit Instance", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  TENANT_INSTANCE_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};
