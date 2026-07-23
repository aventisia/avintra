import { CrudActionType } from "@avplatform/ui/types";

import { QueryTabItem } from "@/components/QueryTab";

const FLOWS_QUERY_KEY = ["flows"];

const TABLE_HEADING = "Agents";

const TABLE_KEY = "flows";

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
  { label: "Archived", value: "archived" },
] as QueryTabItem[];

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
  TABLE_HEADING,
  TABLE_KEY,
  getDialogHeadingDescription,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
};
