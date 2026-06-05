import { QueryTabItem } from "@/components/QueryTab";

import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the triggers query to be used in the query client. ["triggers"]
 */
const DATA_QUERY_KEY = ["message-triggers"];

/**
 * The heading for the triggers table.
 */
const TABLE_HEADING = "Message Triggers";

const TABLE_KEY = "message-triggers";

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

/**
 * The column used for searching in the triggers.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Message Trigger", description: "" };
    case "read":
      return { heading: "Message Trigger", description: "" };
    case "update":
      return { heading: "Edit Message Trigger", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
};
