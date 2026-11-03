import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the SubPlansTable component.
const SubPlansTable = lazy(() =>
  import("@/features/06-super-admin/subscription-plans-table/components/SubPlansTable.ee").then(
    (module) => ({
      default: module.SubPlansTable,
    }),
  ),
);

/**
 * Renders the SubscriptionPlansPage component.
 * @returns JSX element representing the SubscriptionPlansPage component.
 */
export const SubscriptionPlansPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <SubPlansTable />
    </Suspense>
  );
};
