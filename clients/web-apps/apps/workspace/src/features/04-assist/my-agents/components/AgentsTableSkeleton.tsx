import { Skeleton } from "@avplatform/ui";
import { Card, CardContent, CardHeader } from "@avplatform/ui/cards";

export const AgentsTableSkeleton: React.FC = () => {
  return (
    <section className="mx-auto max-w-screen-lg space-y-4 pb-4 pt-[17px]">
      <div className="flex h-[1.75rem] items-center justify-between">
        <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[8rem]" />
        <Skeleton className="h-6 w-[5rem] rounded-lg mmd:w-[15rem]" />
      </div>
      {/* Card grid skeleton, matching the agents grid layout */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {new Array(8).fill(null).map((_, index) => (
          <Card
            key={index}
            className="relative flex h-[13rem] flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-3.5 pb-2 pt-2.5">
              <Skeleton className="h-8 w-8 rounded-lg bg-accent" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardHeader>
            <CardContent className="flex-1 space-y-2.5 px-3.5 pb-1.5 pt-2">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-8 shrink-0 rounded-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            </CardContent>
            {/* Queues + actions row */}
            <div className="flex items-center justify-between gap-2 px-3.5 pb-2 pt-1">
              <Skeleton className="h-5 w-24 rounded-full" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
