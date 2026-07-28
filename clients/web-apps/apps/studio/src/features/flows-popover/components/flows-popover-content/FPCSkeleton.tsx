import { Skeleton } from "@avplatform/ui";

/**
 * Renders a skeleton component till the time flows are being fetched.
 */
export const FPCSkeleton = () => {
  return (
    <div className="flex h-full w-full flex-col items-center px-4">
      {new Array(3).fill(null).map((_, index) => (
        <div key={index} className="flex w-full gap-3 py-2">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <div className="mt-1 flex flex-col gap-2">
            <Skeleton className="h-2.5 w-[13rem] rounded-md" />
            <Skeleton className="h-2.5 w-[7rem] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};
