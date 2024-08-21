import { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The column used for searching in the flows.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Flow", description: "" };
    case "read":
      return { heading: "Flow", description: "" };
    case "update":
      return { heading: "Edit Flow", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { SEARCH_COLUMN, getDialogHeadingDescription };
