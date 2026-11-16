import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

const UI_BUILDER_QUERY_KEY = ["ui-builder"];

const PUBLISHED_AGENTS_QUERY_KEY = ["agents"];

const MY_INTERFACES_QUERY_KEY = ["my-interfaces"];

const TABLE_HEADING = "UI Builder";

const TABLE_KEY = "ui-builder";

/** Page sizes offered by the table. */
const UI_BUILDER_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const UI_BUILDER_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create UI Builder Project", description: "" };
    case "read":
      return { heading: "UI Builder Project", description: "" };
    case "update":
      return { heading: "Edit UI Builder Project", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  UI_BUILDER_QUERY_KEY,
  PUBLISHED_AGENTS_QUERY_KEY,
  MY_INTERFACES_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  UI_BUILDER_INITIAL_STATE,
  UI_BUILDER_PAGE_SIZE_OPTIONS,
  getDialogHeadingDescription,
};
