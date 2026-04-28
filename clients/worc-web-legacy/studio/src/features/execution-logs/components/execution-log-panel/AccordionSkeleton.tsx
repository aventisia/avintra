import { Skeleton } from "@aventisia/ui";

export default function AccordionSkeleton() {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-lg py-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Open Content */}
      <div className="relative ml-4 space-y-0">
        <div className="relative pb-1 last:pb-0.5">
          <div className="ml-3 flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Skeleton className="h-8 w-8 rounded-full" />

              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2 w-24" />
              </div>
            </div>

            {/* Action placeholder */}
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
        <div className="relative pb-1 last:pb-0.5">
          <div className="ml-3 flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Skeleton className="h-8 w-8 rounded-full" />

              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2 w-24" />
              </div>
            </div>

            {/* Action placeholder */}
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
        <div className="relative pb-1 last:pb-0.5">
          <div className="ml-3 flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Skeleton className="h-8 w-8 rounded-full" />

              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2 w-24" />
              </div>
            </div>

            {/* Action placeholder */}
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
