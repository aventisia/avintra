import { Skeleton } from "@avplatform/ui";

/**
 * Renders the loading placeholder for the User Interfaces master-detail split.
 */
export const MyInterfacesSkeleton: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-2.5*var(--header-height))] w-full overflow-hidden rounded-lg border bg-background">
      <div className="flex w-full flex-shrink-0 flex-col p-2 md:w-[30%]">
        {new Array(8).fill(null).map((_, index) => (
          <div key={index} className="space-y-2 rounded-xl px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-8 shrink-0 rounded-full" />
            </div>
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>

      <div className="w-1.5 shrink-0 bg-slate-200" />

      <div className="hidden w-full flex-shrink-0 flex-col md:flex md:w-[70%]">
        <div className="flex h-16 min-h-16 max-h-16 items-center gap-3 border-b px-3">
          <Skeleton className="h-8 w-8 rounded-lg bg-accent" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex-1 p-3">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};
