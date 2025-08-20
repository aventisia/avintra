import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the Credits Usage component.
const CreditsUsage = lazy(() =>
  import("@/features/credits-usage/components/CreditsUsage").then((module) => ({
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
