import { ContentContainer } from "@/features/sign-up/components/account-setup/ContentContainer";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";

import { BillingForm } from "./BillingForm";

export const BillingAddress = () => {
  // Set dcoument title
  useDocumentTitle("Billing Address");
  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <h2 className="flex items-center text-3xl font-medium text-foreground ">
        Billing Address
      </h2>

      {/* Company Info Form */}

      <BillingForm />
    </ContentContainer>
  );
};
