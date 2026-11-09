import { AppLogo, Header, HeaderContainer } from "@avplatform/layout";
import { SidebarOnDialog } from "@avplatform/layout/sidebar";

import { UserAccountMenu } from "./UserAccountMenu.ee";

const AppHeader = () => {
  return (
    <HeaderContainer>
      <Header>
        <div className="flex flex-grow items-center">
          <SidebarOnDialog appLogo={<AppLogo />} className="flex md:hidden" />
          <AppLogo />
        </div>
        <div className="ml-4 flex items-center gap-4">
          <UserAccountMenu />
        </div>
      </Header>
    </HeaderContainer>
  );
};

export { AppHeader };
