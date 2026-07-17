import { Button } from "@aventisia/ui/buttons";
import { IS_TAURI } from "@aventisia/ui/constants";
import {
  Header,
  HeaderContainer,
  SearchBox,
  SidebarOnDialog,
} from "@aventisia/ui/layout";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { DownloadIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { AvailableCredits } from "@/features/available-credits/AvailableCredits";
import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { AppLogo } from "./AppLogo";
import { TenantSwitchBadge } from "./TenantSwitchBadge";
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
          {userSession?.access_mode == "read_only" && <TenantSwitchBadge />}
        </div>
        {import.meta.env.MODE !== "production" ? <SearchBox /> : null}
        <div className="ml-4 flex items-center gap-4">
          {import.meta.env.VITE_WORKSPACE_API_PATH?.includes(
            "https://localhost",
          ) && <TrustLocalhostSSLButton />}
          {userSession?.deploymentType == "Commercial" ? (
            <AvailableCredits />
          ) : null}
          <div className="flex items-center gap-2.5">
            {!IS_TAURI ? (
              <Tooltip content="Download Desktop App">
                <Button
                  className={cn("hover:bg-white/10")}
                  variant={"ghost"}
                  size={"icon8"}
                  onClick={() => {
                    window.open(
                      `${import.meta.env.VITE_ACCOUNTS_API_PATH}/desktop-app/download/`,
                      "_blank",
                    );
                  }}
                >
                  <DownloadIcon className="h-[1.2rem] w-[1.2rem] text-white/80" />
                </Button>
              </Tooltip>
            ) : null}

            <UnreadNotifications />
          </div>
          <UserAccountModal />
        </div>
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
