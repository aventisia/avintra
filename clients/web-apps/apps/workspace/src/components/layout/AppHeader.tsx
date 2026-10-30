import { Header, HeaderBreadcrumbs, JobsPill, SearchBox } from "@avplatform/layout";
import { SidebarOnDialog } from "@avplatform/layout/sidebar";
import { cn } from "@avplatform/ui/lib";
import {
  type IUserSessionStore,
  useBaseLayoutStore,
  useUserSessionStore,
} from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

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
  const sidebarExpand = useBaseLayoutStore((state) => state.sidebarExpand);

  return (
    <Header className="h-14 shrink-0 gap-4 bg-surface pl-3 pr-4 md:pl-[22px]">
      <div className="flex min-w-0 flex-1 basis-0 items-center gap-3">
        <SidebarOnDialog appLogo={<AppLogo />} className="flex md:hidden" />
        <div className="md:hidden">
          <AppLogo />
        </div>
        <SpaceSelector className={cn("w-40 shrink-0", sidebarExpand && "md:hidden")} />
        {(userSession as IUserSessionStore & { access_mode?: string })?.access_mode ==
          "read_only" && <TenantSwitchBadge />}
        <HeaderBreadcrumbs />
      </div>
      <SearchBox className="h-[34px] w-full max-w-[380px] flex-1" />
      <div className="flex flex-1 basis-0 items-center justify-end gap-2">
        {/* shortcut: no running-jobs count API yet, pass runningCount once the backend exposes one */}
        <JobsPill to="/orchestrator/jobs" />
        {import.meta.env.VITE_WORKSPACE_API_PATH?.includes("https://localhost") && (
          <TrustLocalhostSSLButton />
        )}
        <DownloadDialog />
        <UnreadNotifications />
        <UserAccountModal />
      </div>
    </Header>
  );
};

export default AppHeader;
