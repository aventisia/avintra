import { DialogCrudAction } from "@avplatform/ui/types";
import { Archive, User, Users } from "lucide-react";

import { QueryTabItem } from "@/components/QueryTab";

const FLOWS_QUERY_KEY = ["flows"];

const TABLE_HEADING = "Agents";

const TABLE_KEY = "flows";

/**
 * Key used for the tab in tables tab
 */
const TABLE_TAB_QUERY_PARAM = "tab";

/**
 * Tabs to be used in tables tab
 */
const TABLE_VIEW_TABS = [
  { label: "Personal", value: "personal", icon: User },
  { label: "Shared", value: "shared", icon: Users },
  { label: "Archived", value: "archived", icon: Archive },
] as QueryTabItem[];

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
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
