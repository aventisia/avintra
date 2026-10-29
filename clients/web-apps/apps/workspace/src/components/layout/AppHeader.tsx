import {
  Header,
  HeaderBreadcrumbs,
  HeaderContainer,
  JobsPill,
  SearchBox,
} from "@avplatform/layout";
import { SidebarOnDialog } from "@avplatform/layout/sidebar";
import { type IUserSessionStore, useUserSessionStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { AvailableCredits } from "@/features/available-credits/AvailableCredits.ee";
import { DownloadDialog } from "@/features/desktop-download";
import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";

import { AppLogo } from "./AppLogo";
import { SpaceSelector } from "./SpaceSelector";
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
        <div className="flex min-w-0 flex-grow items-center">
          <SidebarOnDialog appLogo={<AppLogo />} className="flex md:hidden" />
          <AppLogo />
          <SpaceSelector />
          {(userSession as IUserSessionStore & { access_mode?: string })?.access_mode ==
            "read_only" && <TenantSwitchBadge />}
          <HeaderBreadcrumbs className="ml-3" />
        </div>
        <SearchBox />
        {/* shortcut: no running-jobs count API yet, pass runningCount once the backend exposes one */}
        <JobsPill to="/orchestrator/jobs" />
        <div className="ml-4 flex items-center gap-4">
          {import.meta.env.VITE_WORKSPACE_API_PATH?.includes("https://localhost") && (
            <TrustLocalhostSSLButton />
          )}
          {userSession?.deploymentType == "Commercial" ? <AvailableCredits /> : null}
          <div className="flex items-center gap-2.5">
            <DownloadDialog />
            <UnreadNotifications />
          </div>
          <UserAccountModal />
        </div>
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
