import { DialogCrudAction } from "@avplatform/ui/types";
import { Library, User, Users } from "lucide-react";

import { QueryTabItem } from "@/components/QueryTab";

/**
 * The unique key for the skill query to be used in the query client. ["skill"]
 */
const DATA_QUERY_KEY = ["skill"];
const DETAIL_DATA_QUERY_KEY = ["skill-details"];

/**
 * The heading for the skill table.
 */
const TABLE_HEADING = "Skills";

const TABLE_KEY = "skill";
const DETAIL_TABLE_KEY = "skill-details";

/**
 * Key used for the query param in tables tab.
 */
const TABLE_TAB_QUERY_PARAM = "tab";

/**
 * Tabs to be used in tables tab.
 */
const TABLE_VIEW_TABS = [
  { label: "Personal", value: "personal", icon: User },
  { label: "Shared", value: "shared", icon: Users },
  { label: "Library", value: "library", icon: Library },
] as QueryTabItem[];

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Skill", description: "" };
    case "read":
      return { heading: "Skill", description: "" };
    case "update":
      return { heading: "Edit Skill", description: "" };
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
