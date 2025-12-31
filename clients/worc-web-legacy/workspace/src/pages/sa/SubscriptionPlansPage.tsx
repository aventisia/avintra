import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the SubPlansTable component.
const SubPlansTable = lazy(() =>
  import(
    "@/features/sa/subscription-plans-table/components/SubPlansTable"
  ).then((module) => ({
    default: module.SubPlansTable,
  })),
);

/**
 * Renders the SubscriptionPlansPage component.
 * @returns JSX element representing the SubscriptionPlansPage component.
 */
export const SubscriptionPlansPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <SubPlansTable />
    </Suspense>
  );
};
