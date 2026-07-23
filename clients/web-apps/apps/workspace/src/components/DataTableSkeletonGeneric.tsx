import { Skeleton } from "@avplatform/ui";
import React from "react";

export type DataTableSkeletonProps = {
  columnCount: number;
  rowCount: number;
  showHeader?: boolean;
  showPagination?: boolean;
  customHeader?: React.ReactNode;
  customPagination?: React.ReactNode;
};

export const DataTableSkeletonGeneric = ({
  columnCount,
  rowCount,
  customHeader,
  customPagination,
  showHeader = true,
  showPagination = true,
}: DataTableSkeletonProps) => {
  return (
    <section className="min-h-[12rem] space-y-4 px-0 py-5">
      {customHeader ?? (showHeader && <DataTableHeaderSkeleton />)}
      <div className="flex flex-col gap-6">
        {new Array(rowCount).fill(null).map(() => (
          <div key={window.crypto.randomUUID()} className="flex w-full gap-6">
            {new Array(columnCount).fill(null).map(() => (
              <Skeleton className="h-7 flex-grow rounded-md" key={window.crypto.randomUUID()} />
            ))}
          </div>
        ))}
      </div>
      {customPagination ?? (showPagination && <DataTablePaginationSkeleton />)}
    </section>
  );
};

export const DataTableHeaderSkeleton = () => (
  <div className="flex h-[1.75rem] items-center justify-between">
    <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[8rem]" />
    <div className="flex gap-4">
      <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[15rem]" />
      <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[5rem]" />
      <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[5rem]" />
    </div>
  </div>
);
export const DataTablePaginationSkeleton = () => (
  <div className="flex h-[2rem] items-center justify-between">
    <Skeleton className="h-7 w-[5rem] rounded-lg mmd:w-[8rem]" />
    <div className="flex gap-4">
      <Skeleton className="h-7 w-[5rem] rounded-lg mmd:w-[8rem]" />
      <Skeleton className="h-7 w-[5rem] rounded-lg mmd:w-[8rem]" />
      <Skeleton className="h-7 w-[5rem] rounded-lg mmd:w-7" />
      <Skeleton className="h-7 w-[5rem] rounded-lg mmd:w-7" />
      <Skeleton className="h-7 w-[5rem] rounded-lg mmd:w-7" />
      <Skeleton className="h-7 w-[5rem] rounded-lg mmd:w-7" />
    </div>
  </div>
);
