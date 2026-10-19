/**
 * Loading placeholder matching the dialog body layout.
 */
export const PolicySkeleton = () => (
  <div className="animate-pulse space-y-5">
    <div className="grid grid-cols-2 gap-3">
      <div className="h-[124px] rounded-xl bg-muted" />
      <div className="h-[124px] rounded-xl bg-muted" />
    </div>
    <div className="h-11 rounded-xl bg-muted" />
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/3 rounded bg-muted" />
            <div className="h-2.5 w-1/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
