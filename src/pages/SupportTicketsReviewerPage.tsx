import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";

import { Suspense, lazy } from "react";

// Lazy load the SupportTicketsTable component.
const SupportTicketsTable = lazy(() =>
  import(
    "@/features/support-tickets-table/components/SupportTicketsTable"
  ).then((module) => ({
    default: module.SupportTicketsTable,
  })),
);

/**
 * Renders the SupportTicketsPage component.
 * @returns JSX element representing the SupportTicketsPage component.
 */
export const SupportTicketsReviewerPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <SupportTicketsTable />
    </Suspense>
  );
};
