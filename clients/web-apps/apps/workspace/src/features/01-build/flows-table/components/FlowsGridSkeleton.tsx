import { Skeleton } from "@avplatform/ui";

interface FlowsGridSkeletonProps {
  count?: number;
}

/**
 * Loading placeholder for the Agents grid view. Mirrors the FlowCard layout so
 * the transition from skeleton to content is seamless.
 */
export const FlowsGridSkeleton = ({ count = 8 }: FlowsGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 2xl:grid-cols-4 2xl:gap-6">
      {new Array(count).fill(null).map((_, index) => (
        <div key={index} className="flex flex-col rounded-md border border-line bg-surface">
          <div className="flex items-start gap-3 p-4 pb-0">
            <Skeleton className="size-9 rounded-md" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="mx-4 mb-4 mt-3 flex h-10 flex-col justify-center gap-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex h-10 items-center gap-3 border-t border-line px-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};
