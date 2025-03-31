import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the InovicesTable component.
const InovicesTable = lazy(() =>
  import("@/features/billing-table/components/InovicesTable").then(
    (module) => ({
      default: module.InovicesTable,
    }),
  ),
);

/**
 * Renders the BillingPage component.
 * @returns JSX element representing the BillingPage component.
 */
export const BillingPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <InovicesTable />
    </Suspense>
  );
};
