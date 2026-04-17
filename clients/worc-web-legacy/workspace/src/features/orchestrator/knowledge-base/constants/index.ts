import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the knowledgeBase query to be used in the query client. ["knowledgeBase"]
 */
const DATA_QUERY_KEY = ["knowledgeBase"];
const DETAIL_DATA_QUERY_KEY = ["knowledgeBase-details"];

/**
 * The heading for the knowledgeBase table.
 */
const TABLE_HEADING = "Knowledge Base";

const TABLE_KEY = "knowledge-base";
const DETAIL_TABLE_KEY = "knowledge-base-details";

/**
 * The column used for searching in the knowledgeBase.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Knowledge Base", description: "" };
    case "read":
      return { heading: "Knowledge Base", description: "" };
    case "update":
      return { heading: "Edit Knowledge Base", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  DETAIL_DATA_QUERY_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
  DETAIL_TABLE_KEY,
};
