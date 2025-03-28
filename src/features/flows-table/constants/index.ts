import { CrudActionType } from "@/react-toolkit/types/literal-types";

const FLOWS_QUERY_KEY = ["flows"];

const PAGE_HEADER = "Agents";

/**
 * The column used for searching in the flows.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Agent", description: "" };
    case "read":
      return { heading: "Agent", description: "" };
    case "update":
      return { heading: "Edit Agent", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  FLOWS_QUERY_KEY,
  PAGE_HEADER,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};
