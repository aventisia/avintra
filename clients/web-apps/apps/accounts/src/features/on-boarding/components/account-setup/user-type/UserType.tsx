import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "../ContentContainer";
import UserTypeSelection from "./UserTypeSelection";

export const UserType = () => {
  // Set document title
  useDocumentTitle("Create account");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <UserTypeSelection />
    </ContentContainer>
  );
};
