import { Skeleton } from "@aventisia/ui";

/**
 * Renders a skeleton component till the time flows are being fetched.
 */
export const AgentsAssistSkeleton = () => {
  return (
    <div className="flex h-full w-full flex-col items-center px-4">
      {new Array(5).fill(null).map((_, index) => (
        <div key={index} className="flex w-full gap-3 py-2">
          <div className="mt-1 flex flex-grow flex-col gap-2">
            <Skeleton className="h-2.5 w-[13rem] rounded-md" />
            <Skeleton className="h-2.5 w-[7rem] rounded-md" />
          </div>
          <Skeleton className="h-5 w-5 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
