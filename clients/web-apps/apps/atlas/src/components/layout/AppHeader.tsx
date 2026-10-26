import { Header, HeaderContainer } from "@avplatform/layout";

import { UserAccountModal } from "@/components/user-account/UserAccountModal";

import { AppLogo } from "./AppLogo";

const AppHeader: React.FC = () => {
  return (
    <HeaderContainer>
      <Header>
        <div className="flex flex-grow items-center">
          <AppLogo />
        </div>
        <div className="ml-4 flex items-center gap-4">
          <UserAccountModal />
        </div>
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
