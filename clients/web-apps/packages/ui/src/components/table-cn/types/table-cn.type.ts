import type { ComponentType } from "react";

import type { TABLE_CN_FILTER_VARIANTS } from "../constants/table-cn.constant";

export type TableCNFilterVariant = (typeof TABLE_CN_FILTER_VARIANTS)[number];

export type TableCNFilterOption = {
  label: string;
  value: string;
  /** Overrides the count TableCN derives from the loaded rows. */
  count?: number;
  icon?: ComponentType<{ className?: string }>;
};

export type TableCNQueryKeys = {
  page: string;
  perPage: string;
  sort: string;
};

export type TableCNHistoryMode = "push" | "replace";

export type TableCNRangeValue = [number | undefined, number | undefined];

export type TableCNRowLabels = {
  singular: string;
  plural: string;
};
