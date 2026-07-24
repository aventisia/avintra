import { DialogCrudAction } from "@avplatform/ui/types";

import { QueryTabItem } from "@/components/QueryTab";

/**
 * The unique key for the queues query to be used in the query client. ["queues"]
 */
const DATA_QUERY_KEY = ["queues"];

const QUEUE_AGENT_KEY = "QUEUE_AGENT";
const QUEUE_USER_KEY = "QUEUE_USER";

/**
 * The heading for the queues table.
 */
const TABLE_HEADING = "Queues";

const TABLE_KEY = "queues";

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
      return { heading: "Create Queue", description: "" };
    case "read":
      return { heading: "Queue", description: "" };
    case "update":
      return { heading: "Edit Queue", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  QUEUE_AGENT_KEY,
  QUEUE_USER_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
};
