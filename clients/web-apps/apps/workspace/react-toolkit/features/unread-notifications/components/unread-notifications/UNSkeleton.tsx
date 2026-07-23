import { Skeleton } from "@avplatform/ui";

/**
 * Renders a skeleton component till the time unread notifications are being fetched.
 */
export const UNSkeleton = () => {
  return (
    <div className="flex h-full w-full flex-col items-center">
      {new Array(3).fill(null).map((_, index) => (
        <div key={index} className="flex w-full gap-3 p-3.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-2.5 w-[7rem] rounded-md" />
            <Skeleton className="h-2.5 w-[16rem] rounded-md" />
            <Skeleton className="h-2.5 w-[16rem] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};
