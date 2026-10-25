import type { TableCNQueryKeys } from "../types/table-cn.type";

export const TABLE_CN_FILTER_VARIANTS = [
  "text",
  "number",
  "date",
  "dateRange",
  "select",
  "multiSelect",
] as const;

export const TABLE_CN_DEFAULT_QUERY_KEYS: TableCNQueryKeys = {
  page: "page",
  perPage: "perPage",
  sort: "sort",
};

export const TABLE_CN_DEFAULT_PAGE_SIZE = 10;

export const TABLE_CN_DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export const TABLE_CN_FILTER_DEBOUNCE_MS = 300;

export const TABLE_CN_SELECT_COLUMN_ID = "select";

export const TABLE_CN_ACTIONS_COLUMN_ID = "actions";

export const TABLE_CN_STORAGE_KEY_PREFIX = "table-cn:";
