import { CrudActionType } from "@/react-toolkit/types/literal-types";

const MODELS_QUERY_KEY = ["models"];

const TABLE_HEADING = "AI Models";

/**
 * The column used for searching in the models.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Model", description: "" };
    case "read":
      return { heading: "Model", description: "" };
    case "update":
      return { heading: "Edit model", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  MODELS_QUERY_KEY,
  TABLE_HEADING,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
};
