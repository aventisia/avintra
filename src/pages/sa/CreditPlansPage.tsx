import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the CreditPlansTable component.
const CreditPlansTable = lazy(() =>
  import("@/features/sa/credit-plans-table/components/CreditPlansTable").then(
    (module) => ({
      default: module.CreditPlansTable,
    }),
  ),
);

/**
 * Renders the CreditPlans component.
 * @returns JSX element representing the CreditPlans component.
 */
export const CreditPlansPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <CreditPlansTable />
    </Suspense>
  );
};
