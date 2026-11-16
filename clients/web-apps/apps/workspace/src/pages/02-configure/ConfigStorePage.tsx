import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the ConfigStoresTable component.
const ConfigStoresTable = lazy(() =>
  import("@/features/02-configure/config-store-table/components/ConfigStoresTable").then(
    (module) => ({
      default: module.ConfigStoresTable,
    }),
  ),
);

/**
 * Renders the ConfigStorePage component.
 * @returns JSX element representing the ConfigStoresTable component.
 */
export const ConfigStorePage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <ConfigStoresTable />
    </Suspense>
  );
};
