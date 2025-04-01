import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the PricingPlansTable component.
const PricingPlansTable = lazy(() =>
  import("@/features/pricing-table/components/PricingPlansTable").then(
    (module) => ({
      default: module.PricingPlansTable,
    }),
  ),
);

/**
 * Renders the PricingPage component.
 * @returns JSX element representing the PricingPage component.
 */
export const PricingPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <PricingPlansTable />
    </Suspense>
  );
};
