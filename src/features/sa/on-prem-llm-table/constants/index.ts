import { CrudActionType } from "@aventisia/ui/types";

const ONPREM_LLM_QUERY_KEY = ["on_prem_llm"];

const TABLE_HEADING = "On-prem LLMs";

/**
 * The column used for searching in the models.
 */
const SEARCH_COLUMN = "llm";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create LLM", description: "" };
    case "read":
      return { heading: "LLM", description: "" };
    case "update":
      return { heading: "Edit LLM", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  ONPREM_LLM_QUERY_KEY,
  TABLE_HEADING,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
};
