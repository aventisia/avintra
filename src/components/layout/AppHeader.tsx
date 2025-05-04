import {
  Header,
  HeaderContainer,
  SearchBox,
  SidebarOnDialog,
} from "@aventisia/ui/layout";
import { useShallow } from "zustand/react/shallow";

import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { useTauriStore } from "@/stores/tauri-store";

import { AppLogo } from "./AppLogo";

const AppHeader: React.FC = () => {
  // Get the state if app is open in tauri window
  const { isTauri } = useTauriStore(
    useShallow((state) => ({
      isTauri: state.isTauri,
    })),
  );

  return (
    <HeaderContainer>
      <Header>
        <div className="flex flex-grow items-center">
          {!isTauri && (
            <SidebarOnDialog appLogo={<AppLogo />} className="flex md:hidden" />
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
