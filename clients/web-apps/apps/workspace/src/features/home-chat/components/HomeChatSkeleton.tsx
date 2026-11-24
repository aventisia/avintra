import { Skeleton } from "@avplatform/ui";

/** Placeholder for a Home chat page while its data or code loads. */
export const HomeChatSkeleton = ({ label }: { label: string }) => (
  <div role="status" aria-label={label} className="mx-auto w-full max-w-3xl space-y-3 p-6">
    <Skeleton className="h-6 w-1/2 rounded" />
    <Skeleton className="h-40 w-full rounded-xl" />
  </div>
);
