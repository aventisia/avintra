import { useDocumentTitle } from "@avplatform/ui/hooks";

import BillingTabs from "./BillingTabs/BillingTabs.ee";

export const Billing = () => {
  // Set the document title
  useDocumentTitle("Tenant");

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-2">
        <p className="text-title text-ink">Tenant</p>
      </div>

      <div className="min-h-[82vh] rounded-lg border bg-surface">
        <BillingTabs />
      </div>
    </div>
  );
};
