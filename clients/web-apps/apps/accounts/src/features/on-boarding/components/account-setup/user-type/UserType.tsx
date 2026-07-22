import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";

import { ContentContainer } from "../ContentContainer";
import UserTypeSelection from "./UserTypeSelection";

export const UserType = () => {
  // Set document title
  useDocumentTitle("Create Account");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <UserTypeSelection />
    </ContentContainer>
  );
};
