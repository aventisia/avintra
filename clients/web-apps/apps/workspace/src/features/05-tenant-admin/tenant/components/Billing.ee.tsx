import { useDocumentTitle } from "@avplatform/ui/hooks";

import BillingTabs from "./BillingTabs/BillingTabs.ee";

export const Billing = () => {
  useDocumentTitle("Tenant");

  return (
    <div className="space-y-5 py-4">
      <div>
        <h1 className="text-title text-ink">Tenant</h1>
        <p className="text-[13px] text-muted-foreground">
          Plan, credits, billing and workspace preferences.
        </p>
      </div>
      <BillingTabs />
    </div>
  );
};
