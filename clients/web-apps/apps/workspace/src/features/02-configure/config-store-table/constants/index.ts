import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the config stores query to be used in the query client.
 */
const DATA_QUERY_KEY = ["configstore"];

/**
 * The heading for the config stores table.
 */
const TABLE_HEADING = "Key Store";

const TABLE_KEY = "config-store";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create key store", description: "" };
    case "read":
      return { heading: "Key store", description: "" };
    case "update":
      return { heading: "Edit key store", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, getDialogHeadingDescription, TABLE_HEADING, TABLE_KEY };
