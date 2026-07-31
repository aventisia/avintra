import { DataTableSkeleton } from "@avplatform/ui/data-table";

/**
 * Skeleton placeholder while the tools table is loading.
 */
export const ToolsTableSkeleton = () => {
  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <DataTableSkeleton />
    </div>
  );
};
