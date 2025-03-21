import { lazy, Suspense } from "react";

import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";

// Lazy load the KeystoresTable component.
const KeystoresTable = lazy(() =>
  import(
    "@/features/orchestrator/keystore-table/components/KeystoresTable"
  ).then((module) => ({
    default: module.KeystoresTable,
  })),
);

/**
 * Renders the KeystorePage component.
 * @returns JSX element representing the KeystoresTable component.
 */
export const KeystorePage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <KeystoresTable />
    </Suspense>
  );
};
