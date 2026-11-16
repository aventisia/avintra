import { Skeleton } from "@avplatform/ui";

const ROWS = 6;

export const DayTimelineSkeleton = ({ label }: { label: string }) => (
  <div aria-busy="true" aria-label={label}>
    <div className="flex h-9 items-center justify-between px-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-12" />
    </div>
    <div className="flex flex-col gap-px px-2">
      {Array.from({ length: ROWS }, (_, i) => (
        <div
          key={i}
          className="grid grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 px-2.5 py-1.5"
        >
          <Skeleton className="row-span-2 size-1.5 rounded-full" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="col-span-2 h-2.5 w-24" />
        </div>
      ))}
    </div>
  </div>
);
