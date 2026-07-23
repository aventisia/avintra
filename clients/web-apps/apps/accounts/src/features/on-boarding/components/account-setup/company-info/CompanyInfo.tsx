import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "../ContentContainer";
import { ContentHeader } from "../ContentHeader";
import { CompanyInfoForm } from "./CompanyInfoForm";

export const CompanyInfo = () => {
  // Set dcoument title
  useDocumentTitle("Company Info");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Tell us about your company"
        smallerHeading="Please enter the company details"
      />

      {/* Company Info Form */}
      <CompanyInfoForm />
    </ContentContainer>
  );
};
