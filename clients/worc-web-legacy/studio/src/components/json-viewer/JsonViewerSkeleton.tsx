import { Skeleton } from "@aventisia/ui";

export default function JsonViewerSkeleton() {
  return (
    <div className="h-[60vh] w-full overflow-hidden rounded-md bg-gray-50 p-2">
      <div className="space-y-2">
        {/* Simulating nested JSON structure */}
        <div className="flex items-start gap-2">
          <Skeleton className="mt-1 h-3 w-3 flex-shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-44" />
        </div>

        <div className="ml-6 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <Skeleton className="mt-1 h-3 w-3 flex-shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="ml-6 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>

          <div className="mt-2 flex items-start gap-2">
            <Skeleton className="mt-1 h-3 w-3 flex-shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="ml-6 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-72" />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <Skeleton className="mt-1 h-3 w-3 flex-shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="ml-6 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <Skeleton className="mt-1 h-3 w-3 flex-shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="ml-6 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
