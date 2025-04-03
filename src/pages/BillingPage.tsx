import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the Billings component.
const Billings = lazy(() =>
  import("@/features/billing-table/components/Billings").then((module) => ({
    default: module.Billings,
  })),
);

/**
 * Renders the BillingPage component.
 * @returns JSX element representing the BillingPage component.
 */
export const BillingPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <Billings />
    </Suspense>
  );
};
