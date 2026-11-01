import { TABLE_CN_ACTIONS_COLUMN_ID, TableCNRowLabels } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

/**
 * The unique key for the machines query to be used in the query client. ["machines"]
 */
const DATA_QUERY_KEY = ["machines"];

/**
 * The heading for the machines table.
 */
const TABLE_HEADING = "Machines";

const TABLE_KEY = "machines";

/** Page sizes offered by the table, unchanged from the legacy table. */
const MACHINES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const MACHINES_ROW_LABELS: TableCNRowLabels = { singular: "machine", plural: "machines" };

const MACHINES_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add machine", description: "" };
    case "read":
      return { heading: "Machine", description: "" };
    case "update":
      return { heading: "Edit machine", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  MACHINES_INITIAL_STATE,
  MACHINES_PAGE_SIZE_OPTIONS,
  MACHINES_ROW_LABELS,
  TABLE_HEADING,
  TABLE_KEY,
};

export const sortAsAssignedFirst = <T extends { isAssigned: boolean; name: string }>(
  a: T,
  b: T,
) => {
  if (a.isAssigned && !b.isAssigned) return -1;
  if (!a.isAssigned && b.isAssigned) return 1;
  return a?.name?.localeCompare(b.name);
};
