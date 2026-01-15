import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the Billings component.
const Preferences = lazy(() =>
  import(
    "@/features/tenant/components/BillingTabs/preferences/Preferences"
  ).then((module) => ({
    default: module.default,
  })),
);

/**
 * Renders the BillingPage component.
 * @returns JSX element representing the BillingPage component.
 */
export const PreferencesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <div className="space-y-4 py-4">
        <p className="text-lg font-medium">Preferences</p>

        <div className="min-h-[82vh] p-4 rounded-lg border bg-white">
          <Preferences />
        </div>
      </div>
    </Suspense>
  );
};
