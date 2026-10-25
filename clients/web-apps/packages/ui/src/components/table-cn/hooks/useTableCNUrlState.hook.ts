import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { type TableCNHistoryMode, type TableCNQueryKeys } from "../types/table-cn.type";
import { type TableCNColumnIndex } from "../utils/table-cn-column-index.util";
import {
  getColumnFiltersKey,
  getFilterParamsKey,
  isSameSorting,
  parsePositiveIntegerParam,
  parseSortingParam,
  readColumnFilters,
  serializeSorting,
  setSearchParam,
  writeColumnFilters,
} from "../utils/table-cn-url.util";
import { useDebouncedCallback } from "./useDebouncedCallback.hook";

type FiltersDraft = {
  filters: ColumnFiltersState;
  /** URL filters the draft was made against; once the URL holds other filters, the draft is dropped. */
  sourceKey: string;
  isWritePending: boolean;
};

type UseTableCNUrlStateOptions = {
  queryKeys: TableCNQueryKeys;
  columnIndex: TableCNColumnIndex;
  defaultPageSize: number;
  defaultSorting: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  history: TableCNHistoryMode;
  debounceMs: number;
};

const readSorting = (
  sortParam: string | null,
  sortableIds: ReadonlySet<string>,
  defaultSorting: SortingState,
) => {
  if (sortParam === null) return defaultSorting;
  if (sortParam === "") return [];
  return parseSortingParam(sortParam, sortableIds) ?? defaultSorting;
};

const getSortParam = (sorting: SortingState, defaultSorting: SortingState) => {
  if (isSameSorting(sorting, defaultSorting)) return undefined;
  return sorting.length === 0 ? "" : serializeSorting(sorting);
};

/**
 * Keeps a table's page, page size, sorting, and column filters in the URL query string.
 * Filter edits apply at once and reach the URL after `debounceMs`; other changes write immediately.
 * Parameters equal to their default are left out of the URL.
 */
export const useTableCNUrlState = ({
  queryKeys,
  columnIndex,
  defaultPageSize,
  defaultSorting,
  initialColumnFilters,
  history,
  debounceMs,
}: UseTableCNUrlStateOptions) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePositiveIntegerParam(searchParams.get(queryKeys.page)) ?? 1;
  const pageSize =
    parsePositiveIntegerParam(searchParams.get(queryKeys.perPage)) ?? defaultPageSize;
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize],
  );

  const sortParam = searchParams.get(queryKeys.sort);
  const sorting = useMemo(
    () => readSorting(sortParam, columnIndex.sortableIds, defaultSorting),
    [sortParam, columnIndex, defaultSorting],
  );

  const urlFiltersKey = getFilterParamsKey(searchParams, columnIndex.filterVariants);
  const urlFilters = useMemo(
    () => readColumnFilters(new URLSearchParams(urlFiltersKey), columnIndex.filterVariants),
    [urlFiltersKey, columnIndex],
  );

  const [filtersDraft, setFiltersDraft] = useState<FiltersDraft | null>(() =>
    initialColumnFilters?.length && urlFilters.length === 0
      ? { filters: initialColumnFilters, sourceKey: urlFiltersKey, isWritePending: false }
      : null,
  );

  const activeDraft = filtersDraft?.sourceKey === urlFiltersKey ? filtersDraft : null;
  const columnFilters = activeDraft?.filters ?? urlFilters;

  const updateSearchParams = useCallback(
    (update: (params: URLSearchParams) => void) => {
      const nextParams = new URLSearchParams(searchParams);
      update(nextParams);
      if (nextParams.toString() === searchParams.toString()) return;

      setSearchParams(nextParams, { replace: history === "replace", preventScrollReset: true });
    },
    [history, searchParams, setSearchParams],
  );

  const setPagination = useCallback(
    (nextPagination: PaginationState) => {
      const pageIndex =
        nextPagination.pageSize === pagination.pageSize ? nextPagination.pageIndex : 0;

      updateSearchParams((params) => {
        setSearchParam(params, queryKeys.page, pageIndex > 0 ? String(pageIndex + 1) : undefined);
        setSearchParam(
          params,
          queryKeys.perPage,
          nextPagination.pageSize === defaultPageSize ? undefined : String(nextPagination.pageSize),
        );
      });
    },
    [defaultPageSize, pagination.pageSize, queryKeys, updateSearchParams],
  );

  const setSorting = useCallback(
    (nextSorting: SortingState) => {
      updateSearchParams((params) =>
        setSearchParam(params, queryKeys.sort, getSortParam(nextSorting, defaultSorting)),
      );
    },
    [defaultSorting, queryKeys, updateSearchParams],
  );

  const writeColumnFiltersToUrl = useDebouncedCallback(
    (nextFilters: ColumnFiltersState, sourceKey: string) => {
      if (sourceKey !== urlFiltersKey) return;

      const nextKey = getColumnFiltersKey(nextFilters, columnIndex.filterVariants);
      setFiltersDraft((draft) => draft && { ...draft, sourceKey: nextKey, isWritePending: false });
      if (nextKey === urlFiltersKey) return;

      updateSearchParams((params) => {
        writeColumnFilters(params, nextFilters, columnIndex.filterVariants);
        params.delete(queryKeys.page);
      });
    },
    debounceMs,
  );

  const setColumnFilters = useCallback(
    (nextFilters: ColumnFiltersState) => {
      setFiltersDraft({ filters: nextFilters, sourceKey: urlFiltersKey, isWritePending: true });
      writeColumnFiltersToUrl(nextFilters, urlFiltersKey);
    },
    [urlFiltersKey, writeColumnFiltersToUrl],
  );

  const resetPageIndex = useCallback(() => {
    updateSearchParams((params) => params.delete(queryKeys.page));
  }, [queryKeys, updateSearchParams]);

  const clampPageIndex = useCallback(
    (pageCount: number) => {
      if (pageCount < 1 || pagination.pageIndex < pageCount) return;

      updateSearchParams((params) =>
        setSearchParam(params, queryKeys.page, pageCount > 1 ? String(pageCount) : undefined),
      );
    },
    [pagination.pageIndex, queryKeys, updateSearchParams],
  );

  return {
    pagination,
    sorting,
    columnFilters,
    hasPendingFilterWrite: activeDraft?.isWritePending ?? false,
    setPagination,
    setSorting,
    setColumnFilters,
    resetPageIndex,
    clampPageIndex,
  };
};
