import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the knowledgeBase query to be used in the query client. ["knowledgeBase"]
 */
const DATA_QUERY_KEY = ["knowledgeBase"];
const DETAIL_DATA_QUERY_KEY = ["knowledgeBase-details"];

/**
 * The heading for the knowledgeBase table.
 */
const TABLE_HEADING = "Knowledge Bases";

const TABLE_KEY = "knowledge-base";
const DETAIL_TABLE_KEY = "knowledge-base-details";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create knowledge base", description: "" };
    case "read":
      return { heading: "Knowledge base", description: "" };
    case "update":
      return { heading: "Edit knowledge base", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  DETAIL_DATA_QUERY_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  TABLE_KEY,
  DETAIL_TABLE_KEY,
};
