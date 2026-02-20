import { Skeleton } from "@aventisia/ui";

export const AgentsTableSkeleton: React.FC = () => {
  return (
    <section className="mx-auto min-h-[12rem] max-w-screen-lg space-y-4 px-0 py-5">
      <div className="flex h-[1.75rem] items-center justify-between">
        <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[8rem]" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[15rem]" />
          <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[10rem]" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {new Array(5).fill(null).map((_, index) => (
          <div key={index} className="flex w-full gap-3">
            <Skeleton className="h-14 flex-grow rounded-md" />
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
