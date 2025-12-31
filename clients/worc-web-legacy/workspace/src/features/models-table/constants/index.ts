import { CrudActionType } from "@aventisia/ui/types";

const MODELS_QUERY_KEY = ["models"];

const TABLE_HEADING = "AI Models";

const TABLE_KEY = "ai-models";

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
  TABLE_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
};
