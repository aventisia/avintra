import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the EmailTriggersTable component.
const EmailTriggersTable = lazy(() =>
  import(
    "@/features/02-configure/triggers/email-triggers-table/components/EmailTriggersTable"
  ).then((module) => ({
    default: module.EmailTriggersTable,
  })),
);

/**
 * Renders the EmailTriggerPage component.
 * @returns JSX element representing the EmailTriggerPage component.
 */
export const EmailTriggerPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <EmailTriggersTable />
    </Suspense>
  );
};
