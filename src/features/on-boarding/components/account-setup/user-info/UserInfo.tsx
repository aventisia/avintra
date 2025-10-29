import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";

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
        biggerHeading="Tell us about yourself"
        smallerHeading="Please enter the details"
      />

      {/* User Info Form */}
      <UserInfoForm />
    </ContentContainer>
  );
};
