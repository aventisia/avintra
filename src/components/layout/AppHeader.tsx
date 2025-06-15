import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import {
  Header,
  HeaderContainer,
  SearchBox,
  SidebarOnDialog,
} from "@aventisia/ui/layout";
import { AppLogo } from "./AppLogo";
import { IS_TAURI } from "@/constants/constants";

const AppHeader: React.FC = () => {
  return (
    <HeaderContainer>
      <Header>
        <div className="flex flex-grow items-center">
          {!IS_TAURI && (
            <SidebarOnDialog
              appLogo={<AppLogo logoSrc="app_logo_dark.svg" />}
              className="flex md:hidden"
            />
          )}
          <AppLogo />
        </div>
        <SearchBox />
        <div className="ml-4 flex items-center gap-4">
          <UnreadNotifications />
          <UserAccountModal />
        </div>
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
