import { DialogCrudAction } from "@avplatform/ui/types";

const PLANS_QUERY_KEY = ["subscription-plans"];

const TABLE_HEADING = "Subscription Plans";

const TABLE_KEY = "subscription-plans";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create subscription plan", description: "" };
    case "read":
      return { heading: "Subscription plan", description: "" };
    case "update":
      return { heading: "Edit subscription plans", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

function displayValue(value: number) {
  if (value === -1) return "Unlimited";
  if (value === 0) return "N/A";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export { PLANS_QUERY_KEY, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription, displayValue };
