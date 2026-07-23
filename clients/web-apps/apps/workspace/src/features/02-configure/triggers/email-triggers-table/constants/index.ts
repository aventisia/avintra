import { CrudActionType } from "@avplatform/ui/types";

import { QueryTabItem } from "@/components/QueryTab";

/**
 * The unique key for the triggers query to be used in the query client. ["triggers"]
 */
const DATA_QUERY_KEY = ["email-triggers"];

/**
 * The heading for the triggers table.
 */
const TABLE_HEADING = "Email Triggers";

const TABLE_KEY = "email-triggers";

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

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Email Trigger", description: "" };
    case "read":
      return { heading: "Email Trigger", description: "" };
    case "update":
      return { heading: "Edit Email Trigger", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
};
