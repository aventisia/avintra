import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the KeystoresTable component.
const KeystoresTable = lazy(() =>
  import("@/features/02-configure/keystore-table/components/KeystoresTable").then((module) => ({
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
