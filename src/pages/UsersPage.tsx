import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the UsersTable component.
const UsersTable = lazy(() =>
  import("@/features/users-table/components/UsersTable").then((module) => ({
    default: module.UsersTable,
  })),
);

/**
 * Renders the UsersPage component.
 * @returns JSX element representing the UsersPage component.
 */
export const UsersPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <UsersTable />
    </Suspense>
  );
};