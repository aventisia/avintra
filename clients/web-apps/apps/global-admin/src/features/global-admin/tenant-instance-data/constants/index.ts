import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state.ee";

const INSTANCE_DATA_QUERY_KEY = "INSTANCE_DATA";

const TABLE_HEADING = "On-prem Tenants";

const TABLE_KEY = "onPremTenantInstanceData";

/** Page sizes offered by the table, unchanged from the legacy table. */
const TENANT_INSTANCE_DATA_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const TENANT_INSTANCE_DATA_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
};

const formatNumber = (num: number) =>
  num?.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

export {
  INSTANCE_DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  TENANT_INSTANCE_DATA_INITIAL_STATE,
  TENANT_INSTANCE_DATA_PAGE_SIZE_OPTIONS,
  formatNumber,
};
