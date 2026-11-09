import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";

import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
} from "@/components/segmented-tabs.constant";

import { BillingHistoryTable } from "./billing-history/components/BillingHistoryTable.ee";
import CompanyDetails from "./comapny-details/CompanyDetails";
import Overview from "./overview/Overview.ee";
import PaymentMethods from "./payment-methods/PaymentMethods.ee";
import Preferences from "./preferences/Preferences";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "paymentMethods", label: "Payment methods" },
  { value: "billingHistory", label: "Billing history" },
  { value: "companyDetails", label: "Billing details" },
  { value: "preferences", label: "Preferences" },
];

const PANEL_CLASS = "rounded-lg bg-surface p-6 ring-1 ring-line";

const BillingTabs = () => (
  <Tabs defaultValue="overview" className="space-y-5">
    <TabsList className={SEGMENTED_TABS_LIST_CLASS}>
      {TABS.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value} className={SEGMENTED_TABS_TRIGGER_CLASS}>
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>

    <TabsContent value="overview">
      <Overview />
    </TabsContent>
    <TabsContent value="paymentMethods">
      <PaymentMethods />
    </TabsContent>
    <TabsContent value="billingHistory" className={PANEL_CLASS}>
      <BillingHistoryTable />
    </TabsContent>
    <TabsContent value="preferences">
      <Preferences />
    </TabsContent>
    <TabsContent value="companyDetails">
      <CompanyDetails />
    </TabsContent>
  </Tabs>
);

export default BillingTabs;
