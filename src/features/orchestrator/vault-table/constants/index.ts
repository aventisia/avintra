/**
 * The unique key for the configs query to be used in the query client. ["configs"]
 */
const DATA_QUERY_KEY = ["vault"];

/**
 * The heading for the configs table.
 */
const TABLE_HEADING = "Vault";

/**
 * The column used for searching in the configs.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (action: "View" | "Edit" | "") => {
  switch (action) {
    case "":
      return { heading: "Add Credential", description: "" };
    case "View":
      return { heading: "Credential", description: "" };
    case "Edit":
      return { heading: "Edit Credential", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
  TABLE_HEADING,
};
