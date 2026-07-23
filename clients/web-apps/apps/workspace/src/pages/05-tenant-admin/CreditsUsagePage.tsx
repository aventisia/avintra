import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the Usage component.
const CreditsUsage = lazy(() =>
  import("@/features/05-tenant-admin/credits-usage/components/CreditsUsage").then((module) => ({
    default: module.CreditsUsage,
  })),
);

/**
 * Renders the CreditsUsage component.
 * @returns JSX element representing the CreditsUsage component.
 */
export const CreditsUsagePage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <CreditsUsage />
    </Suspense>
  );
};
