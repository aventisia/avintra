import { DialogCrudAction } from "@avplatform/ui/types";

import { QueryTabItem } from "@/components/QueryTab";

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

/**
 * Key used for the query param in tables tab
 */
const TABLE_TAB_QUERY_PARAM = "tab";

/**
 * Tabs to be used in tables tab
 */
const TABLE_VIEW_TABS = [
  { label: "Personal", value: "personal" },
  { label: "Shared", value: "shared" },
] as QueryTabItem[];

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
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
  TABLE_HEADING,
  TABLE_KEY,
  DETAIL_TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
};
