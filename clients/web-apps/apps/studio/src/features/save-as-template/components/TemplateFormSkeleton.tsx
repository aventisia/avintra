/**
 * Loading placeholder matching the Save as template form layout.
 */
export const TemplateFormSkeleton = () => (
  <div className="animate-pulse space-y-5" aria-hidden="true">
    <div className="space-y-1.5">
      <div className="h-3 w-24 rounded bg-muted" />
      <div className="h-11 rounded-md bg-muted" />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="h-[104px] rounded-md bg-muted" />
      <div className="h-[104px] rounded-md bg-muted" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-20 rounded bg-muted" />
      <div className="h-8 w-36 rounded-lg bg-muted" />
      <div className="h-24 rounded-md bg-muted" />
    </div>
    <div className="h-14 rounded-md bg-muted" />
  </div>
);
