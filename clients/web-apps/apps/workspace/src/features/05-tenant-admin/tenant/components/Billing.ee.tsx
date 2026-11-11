import { useDocumentTitle } from "@avplatform/ui/hooks";

import { HelpButton } from "@/components/help/HelpButton";

import BillingTabs from "./BillingTabs/BillingTabs.ee";

export const Billing = () => {
  // Set the document title
  useDocumentTitle("Tenant");

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-2">
        <p className="text-lg font-medium">Tenant</p>
        <HelpButton guideId="tenant" />
      </div>

      <div className="min-h-[82vh] rounded-lg border bg-white">
        <BillingTabs />
      </div>
    </div>
  );
};
