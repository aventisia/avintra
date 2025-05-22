import { Skeleton } from "@aventisia/ui";

const FELSkeleton = () => {
  return (
    <div className="flex">
      <div className="w-1/2 pr-2">
        <Skeleton className="h-[calc(100vh-9rem)] w-full" />
      </div>
      <div className="flex h-full w-1/2 flex-col gap-3 border-l pl-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
};

export default FELSkeleton;
