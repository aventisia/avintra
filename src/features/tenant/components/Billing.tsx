import BillingTabs from "./BillingTabs/BillingTabs";

export const Billing = () => {
  return (
    <div className="space-y-4 py-4">
      <p className="text-lg font-medium">Tenant</p>

      <div className="min-h-[82vh] rounded-lg border bg-white">
        <BillingTabs />
      </div>
    </div>
  );
};
