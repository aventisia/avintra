import { DialogCrudAction } from "@avplatform/ui/types";

const ON_PREM_TENANT_QUERY_KEY = ["ON_PREM_TENANT"];

const TABLE_HEADING = "On-prem Tenants";

const TABLE_KEY = "onPremTenant";

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

export { ON_PREM_TENANT_QUERY_KEY, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription };
