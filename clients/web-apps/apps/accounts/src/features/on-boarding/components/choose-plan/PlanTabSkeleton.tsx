import { Skeleton } from "@avplatform/ui";

export const PlanTabSkeleton = () => {
  return (
    <div>
      <div className="h-[60vh] border rounded-lg p-4 space-y-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 shadow-sm animate-pulse">
            {/* Plan name & price */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="flex justify-end mt-5">
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
};
