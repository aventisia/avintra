import { AppLogo, Header, HeaderContainer } from "@avplatform/layout";

import { UserAccountModal } from "@/components/user-account/UserAccountModal";

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
