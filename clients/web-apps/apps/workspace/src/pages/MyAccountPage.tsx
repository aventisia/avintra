import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the UsersTable component.
const MyAccount = lazy(() =>
  import("@/features/my-account/components/MyAccount").then((module) => ({
    default: module.MyAccount,
  })),
);

/**
 * Renders the UserAccountPage component.
 * @returns JSX element representing the UserAccountPage component.
 */
export default function MyAccountPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <MyAccount />
    </Suspense>
  );
}
