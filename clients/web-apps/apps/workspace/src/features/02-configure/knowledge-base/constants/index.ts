import { TABLE_CN_ACTIONS_COLUMN_ID, TableCNRowLabels } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState as kbFilesColumnVisibilityState } from "./kb-files-column-visibility-state";

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

/** Page sizes offered by the files table, unchanged from the legacy table. */
const KB_FILES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const KB_FILES_ROW_LABELS: TableCNRowLabels = { singular: "file", plural: "files" };

const KB_FILES_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: kbFilesColumnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create knowledge base", description: "" };
    case "read":
      return { heading: "Knowledge base", description: "" };
    case "update":
      return { heading: "Edit knowledge base", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  DETAIL_DATA_QUERY_KEY,
  getDialogHeadingDescription,
  KB_FILES_INITIAL_STATE,
  KB_FILES_PAGE_SIZE_OPTIONS,
  KB_FILES_ROW_LABELS,
  TABLE_HEADING,
  TABLE_KEY,
  DETAIL_TABLE_KEY,
};
