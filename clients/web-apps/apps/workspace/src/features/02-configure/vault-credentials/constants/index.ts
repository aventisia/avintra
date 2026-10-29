import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the configs query to be used in the query client. ["configs"]
 */
const DATA_QUERY_KEY = ["vault"];

/**
 * The heading for the configs table.
 */
const TABLE_HEADING = "Vault";

const TABLE_KEY = "vault";

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

export { DATA_QUERY_KEY, getDialogHeadingDescription, TABLE_HEADING, TABLE_KEY };
