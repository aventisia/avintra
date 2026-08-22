import { Archive, User, Users } from "lucide-react";

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
  { label: "Personal", value: "personal", icon: User },
  { label: "Shared", value: "shared", icon: Users },
  { label: "Archived", value: "archived", icon: Archive },
] as QueryTabItem[];

export {
  ARCHIVED_FLOWS_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
};
