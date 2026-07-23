import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "../ContentContainer";
import { ContentHeader } from "../ContentHeader";
import { UserInfoForm } from "./UserInfoForm";

export const UserInfo = () => {
  // Set dcoument title
  useDocumentTitle("User Info");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Select Your Country or Region"
        smallerHeading="We'll show plans and pricing available in your area"
      />

      {/* User Info Form */}
      <UserInfoForm />
    </ContentContainer>
  );
};
