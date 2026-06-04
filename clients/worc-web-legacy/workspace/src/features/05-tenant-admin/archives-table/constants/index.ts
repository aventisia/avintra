import { QueryTabItem } from "@/components/QueryTab";

const ARCHIVED_FLOWS_QUERY_KEY = ["archived-flows"];

const TABLE_HEADING = "Archives";

const TABLE_KEY = "archives";

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

/**
 * The column used for searching in the Archived flows.
 */
const SEARCH_COLUMN = "name";

export {
  ARCHIVED_FLOWS_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  SEARCH_COLUMN,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
};
