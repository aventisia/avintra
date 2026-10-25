import type { PaginationState, Updater } from "@tanstack/react-table";

export const resolveUpdater = <TState>(updater: Updater<TState>, previous: TState): TState =>
  typeof updater === "function" ? (updater as (old: TState) => TState)(previous) : updater;

export const applyPaginationChange = (
  previous: PaginationState,
  next: PaginationState,
): PaginationState => (next.pageSize === previous.pageSize ? next : { ...next, pageIndex: 0 });

export const resetPageIndex = (pagination: PaginationState): PaginationState => ({
  ...pagination,
  pageIndex: 0,
});

export const clampPageIndex = (pagination: PaginationState, pageCount: number): PaginationState => {
  const lastPageIndex = Math.max(pageCount - 1, 0);
  return pagination.pageIndex > lastPageIndex
    ? { ...pagination, pageIndex: lastPageIndex }
    : pagination;
};
