const SkeletonSection = ({ cardHeight }: { cardHeight: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="h-3 w-20 rounded bg-muted" />
      <div className="h-6 w-24 rounded-md bg-muted" />
    </div>
    <div className={`${cardHeight} rounded-md bg-muted`} />
  </div>
);

/**
 * Loading placeholder matching the Input/output layout.
 */
export const InputOutputSkeleton = () => (
  <div className="animate-pulse space-y-6" aria-hidden="true">
    <SkeletonSection cardHeight="h-64" />
    <SkeletonSection cardHeight="h-28" />
  </div>
);
