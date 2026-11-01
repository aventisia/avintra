import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";
import { Library } from "lucide-react";

import { QueryTabItem } from "@/components/QueryTab";

import { columnVisibilityState } from "./skill-files-column-visibility-state.constant";

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

/** Page sizes offered by the table, unchanged from the legacy table. */
const SKILL_FILES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const SKILL_FILES_ROW_LABELS = { singular: "file", plural: "files" };

const SKILL_FILES_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

/**
 * Key used for the query param in tables tab.
 */
const TABLE_TAB_QUERY_PARAM = "tab";

/**
 * Tabs to be used in tables tab.
 */
const TABLE_VIEW_TABS = [
  { label: "All", value: "all" },
  { label: "Library", value: "platform", icon: Library },
] as QueryTabItem[];

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create skill", description: "" };
    case "read":
      return { heading: "Skill", description: "" };
    case "update":
      return { heading: "Edit skill", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  DETAIL_DATA_QUERY_KEY,
  getDialogHeadingDescription,
  SKILL_FILES_INITIAL_STATE,
  SKILL_FILES_PAGE_SIZE_OPTIONS,
  SKILL_FILES_ROW_LABELS,
  TABLE_HEADING,
  TABLE_KEY,
  DETAIL_TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
};
