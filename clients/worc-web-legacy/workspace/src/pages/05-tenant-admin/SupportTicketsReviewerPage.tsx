import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the SupportTicketsTable component.
const SupportTicketsTable = lazy(() =>
  import(
    "@/features/05-tenant-admin/support-tickets-table/components/SupportTicketsTable"
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
