import { CrudActionType } from "@aventisia/ui/types";

const ON_PREM_TENANT_QUERY_KEY = ["ON_PREM_TENANT"];

const TABLE_HEADING = "On-prem Tenants";

const TABLE_KEY = "onPremTenant";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create On-prem Tenant", description: "" };
    case "read":
      return { heading: "On-prem Tenant", description: "" };
    case "update":
      return { heading: "Edit On-prem Tenant", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  ON_PREM_TENANT_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
};
