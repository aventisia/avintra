import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";

import { BillingHistoryTable } from "./billing-history/components/BillingHistoryTable";
import CompanyDetails from "./comapny-details/CompanyDetails";
import Overview from "./overview/Overview";
import PaymentMethods from "./payment-methods/PaymentMethods";
import Preferences from "./preferences/Preferences";

const BillingTabs = () => {
  return (
    <div className="py-2">
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent text-muted-foreground">
          <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-black">
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="paymentMethods"
            className="rounded-none data-[state=active]:border-b-black"
          >
            Payment Methods
          </TabsTrigger>
          <TabsTrigger
            value="billingHistory"
            className="rounded-none data-[state=active]:border-b-black"
          >
            Billing History
          </TabsTrigger>
          <TabsTrigger
            value="companyDetails"
            className="rounded-none data-[state=active]:border-b-black"
          >
            Billing Details
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="rounded-none data-[state=active]:border-b-black"
          >
            Preferences
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="p-6">
          <Overview />
        </TabsContent>

        <TabsContent value="paymentMethods" className="p-6">
          <PaymentMethods />
        </TabsContent>

        <TabsContent value="billingHistory" className="p-6">
          <BillingHistoryTable />
        </TabsContent>

        <TabsContent value="preferences" className="p-6">
          <Preferences />
        </TabsContent>

        <TabsContent value="companyDetails" className="p-6">
          <CompanyDetails />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingTabs;
