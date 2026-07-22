import { Skeleton } from "@/ui/components";

export const DataTableSkeleton: React.FC = () => {
  return (
    <section className="min-h-[12rem] space-y-4 px-0 py-5">
      <div className="flex h-[1.75rem] items-center justify-between">
        <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[8rem]" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[15rem]" />
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[5rem]" />
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[5rem]" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {new Array(10).fill(null).map((_, index) => (
          <div key={index} className="flex w-full gap-6">
            <Skeleton className="h-7 flex-grow rounded-md" />
            <Skeleton className="h-7 flex-grow rounded-md" />
            <Skeleton className="h-7 flex-grow rounded-md" />
            <Skeleton className="h-7 flex-grow rounded-md" />
            <Skeleton className="h-7 flex-grow rounded-md" />
            <Skeleton className="h-7 flex-grow rounded-md" />
          </div>
        ))}
      </div>
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
    </section>
  );
};
