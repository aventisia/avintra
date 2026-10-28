import { Skeleton } from "@avplatform/ui";

const ROWS = 6;

export default function AccordionSkeleton() {
  return (
    <div className="py-1.5">
      <div className="flex h-8 items-center px-4">
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: ROWS }, (_, i) => (
        <div
          key={i}
          className="grid h-6 grid-cols-[64px_72px_minmax(0,1fr)_48px] items-center gap-3 px-4"
        >
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
        </div>
      ))}
    </div>
  );
}
