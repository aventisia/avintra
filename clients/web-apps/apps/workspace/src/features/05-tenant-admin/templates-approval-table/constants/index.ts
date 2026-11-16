import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state";

const TTA_QUERY_KEY = ["TENANT_TEMPLATES_A"];
const PTA_QUERY_KEY = ["PUBLIC_TEMPLATES_A"];

const TABLE_HEADING = "Template Approvals";

const TABLE_KEY = "template-approvals";

/** Page sizes offered by the table, unchanged from the legacy table. */
const TEMPLATES_APPROVAL_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const TEMPLATES_APPROVAL_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

export {
  TTA_QUERY_KEY,
  PTA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  TEMPLATES_APPROVAL_INITIAL_STATE,
  TEMPLATES_APPROVAL_PAGE_SIZE_OPTIONS,
};
