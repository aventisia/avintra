import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the API keys query to be used in the query client. ["apiKeys"]
 */
const DATA_QUERY_KEY = ["apiKeys"];

const TABLE_HEADING = "API Keys";
const TABLE_KEY = "api-keys";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create API Key", description: "" };
    case "read":
      return { heading: "API Key", description: "" };
    case "update":
      return { heading: "Edit API Key", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription };
