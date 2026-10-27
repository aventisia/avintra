import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "../account-setup/ContentContainer";
import { BillingForm } from "./BillingForm";

export const BillingAddress = () => {
  // Set dcoument title
  useDocumentTitle("Billing Address");
  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <h1 className="text-title text-ink">Billing address</h1>

      {/* Company Info Form */}

      <BillingForm />
    </ContentContainer>
  );
};
