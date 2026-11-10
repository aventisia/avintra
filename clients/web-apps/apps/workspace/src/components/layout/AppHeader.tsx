import { Header, HeaderBreadcrumbs, JobsPill, SearchBox } from "@avplatform/layout";
import { SidebarOnDialog } from "@avplatform/layout/sidebar";
import { Button } from "@avplatform/ui/buttons";
import { IS_TAURI } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import {
  type IUserSessionStore,
  useBaseLayoutStore,
  useUserSessionStore,
} from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import {
  BellIcon,
  DownloadSimpleIcon,
  QuestionIcon,
  RocketIcon,
  SparkleIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useHelpPanelStore } from "@/components/help/help-panel.store";
import { ROLE_TA } from "@/constants/roles";
import { DESKTOP_DOWNLOAD_ROUTE } from "@/features/desktop-download";
import { useIsHomeChatAvailable } from "@/features/home-chat";
import { useAccountDialogUrlState } from "@/features/my-account";
import { NOTIFICATIONS_ROUTE } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { SidebarAccountMenu } from "@/react-toolkit/features/user-account/SidebarAccountMenu";
import { useOnboardingStore } from "@/stores/onboarding-store";

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
  const { isHelpOpen, toggleHelp } = useHelpPanelStore(
    useShallow((state) => ({ isHelpOpen: state.isOpen, toggleHelp: state.toggleOpen })),
  );
  const { openAccountDialog } = useAccountDialogUrlState();
  const openGetStartedGuide = useOnboardingStore((state) => state.openGuide);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomeChatAvailable = useIsHomeChatAvailable();

  const handleNewAiChat = () => {
    if (location.pathname === "/") {
      navigate("/", { replace: true, state: { freshAt: Date.now() } });
    } else {
      navigate("/");
    }
  };

  return (
    <Header className="h-14 shrink-0 gap-4 bg-surface pl-3 pr-4 md:pl-[22px]">
      <div className="flex min-w-0 flex-1 basis-0 items-center gap-3">
        <SidebarOnDialog
          appLogo={<AppLogo />}
          footer={
            <div className="px-2.5 py-2">
              <SidebarAccountMenu />
            </div>
          }
          className="flex md:hidden"
        />
        <div className="md:hidden">
          <AppLogo />
        </div>
        <SpaceSelector className={cn("w-40 shrink-0", sidebarExpand && "md:hidden")} />
        {(userSession as IUserSessionStore & { access_mode?: string })?.access_mode ==
          "read_only" && <TenantSwitchBadge />}
        <HeaderBreadcrumbs />
      </div>
      <SearchBox
        className="h-[34px] w-full max-w-[380px] flex-1"
        actions={[
          { label: "My account", Icon: UserIcon, onSelect: openAccountDialog },
          {
            label: "Notifications",
            Icon: BellIcon,
            onSelect: () => navigate(NOTIFICATIONS_ROUTE),
          },
          ...(userSession?.userRoles?.includes(ROLE_TA)
            ? [{ label: "Get started guide", Icon: RocketIcon, onSelect: openGetStartedGuide }]
            : []),
          ...(IS_TAURI
            ? []
            : [
                {
                  label: "Download desktop app",
                  Icon: DownloadSimpleIcon,
                  onSelect: () => navigate(DESKTOP_DOWNLOAD_ROUTE),
                },
              ]),
        ]}
      />
      <div className="flex flex-1 basis-0 items-center justify-end gap-2">
        {/* shortcut: no running-jobs count API yet, pass runningCount once the backend exposes one */}
        <JobsPill to="/orchestrator/jobs" />
        {isHomeChatAvailable && (
          <Tooltip content="New AI chat">
            <Button
              variant="ghost"
              size="icon8"
              aria-label="New AI chat"
              onClick={handleNewAiChat}
              className="text-ink-2 hover:text-ink"
            >
              <SparkleIcon className="size-[18px]" />
            </Button>
          </Tooltip>
        )}
        {import.meta.env.VITE_WORKSPACE_API_PATH?.includes("https://localhost") && (
          <TrustLocalhostSSLButton />
        )}
        <Tooltip content="Help" shortcut="?">
          <Button
            variant="ghost"
            size="icon8"
            aria-label="Help"
            aria-pressed={isHelpOpen}
            onClick={() => toggleHelp()}
            className="text-ink-2 aria-pressed:bg-hover aria-pressed:text-ink"
          >
            <QuestionIcon className="size-[18px]" />
          </Button>
        </Tooltip>
      </div>
    </Header>
  );
};

export default AppHeader;
