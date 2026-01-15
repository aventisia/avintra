import {
  Header,
  HeaderContainer,
  SearchBox,
  SidebarOnDialog,
} from "@aventisia/ui/layout";
import { useShallow } from "zustand/react/shallow";

import { AvailableCredits } from "@/features/available-credits/AvailableCredits";
import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { AppLogo } from "./AppLogo";
import TrustLocalhostSSLButton from "./TrustLocalhostSSLButton";

const AppHeader: React.FC = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  return (
    <HeaderContainer>
      <Header>
        <div className="flex flex-grow items-center">
          <SidebarOnDialog
            appLogo={<AppLogo logoSrc="/app_logo_dark.svg" />}
            className="flex md:hidden"
          />
          <AppLogo />
        </div>
        {import.meta.env.MODE !== "production" ? <SearchBox /> : null}
        <div className="ml-4 flex items-center gap-4">
          {import.meta.env.VITE_WORC_API_PATH?.includes(
            "https://localhost",
          ) && <TrustLocalhostSSLButton />}
          {userSession?.deploymentType == "Commercial" ? (
            <AvailableCredits />
          ) : null}
          <UnreadNotifications />
          <UserAccountModal />
        </div>
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
