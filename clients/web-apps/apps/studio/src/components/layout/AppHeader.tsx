import { Header, HeaderContainer } from "@avplatform/layout";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { useAlertDialogStore, useBrandingStore, useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { AvailableCredits } from "@/features/available-credits/AvailableCredits.ee";
import { Chat } from "@/features/collaboration/components/Chat";
import { PresenceAvatars } from "@/features/collaboration/components/PresenceAvatars";
import { releasePublishActionIfActive } from "@/features/collaboration/hooks/useCollaboration";
import { ExecuteFlow } from "@/features/execute-flow";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { SettingsTrigger } from "@/features/flow-settings/components/SettingsTrigger";
import { FlowVersions } from "@/features/flow-versions/components";
import { PublishFlow } from "@/features/publish-flow/PublishFlow";
import SaveFlow from "@/features/react-flow/components/save-flow/SaveFlow";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { VersionHistoryCloseButton } from "@/features/version-history/components/version-history-panel/VersionHistoryCloseButton";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import AgentName from "./AgentName";
import { AppLogo } from "./AppLogo";
import SearchCommandTrigger from "./Search";
import { StudioViewSwitch } from "./StudioViewSwitch";
import { TenantSwitchBadge } from "./TenantSwitchBadge";
import ViewOnlyVersionSelector from "./ViewOnlyVersionSelector";
import { HeaderActionMenu } from "./header-menu-actions";

const AppHeader: React.FC = () => {
  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isAgentHistory = useIsVersionHistoryRoute();
  const isExecutionLog = useIsExecutionLogsRoute();
  const serverBranding = useBrandingStore((state) => state.branding);
  const headerLabel =
    serverBranding?.appName ||
    (serverBranding && Object.values(serverBranding).some((value) => !!value)
      ? "Agent Builder"
      : undefined);

  // ChatAgent flows hide search, flow settings, and studio preferences.
  const isChatAgent = useCurrentFlowStore((state) => state.isChatAgent);

  // Persistent watcher for the publish alert dialog close. The Publish button does not own
  // the dialog lifecycle, so this header component watches the alert dialog
  // open state and releases the publish lock when the dialog closes (cancel or confirm).
  const isAlertDialogOpen = useAlertDialogStore((state) => state.isAlertDialogOpen);
  const wasAlertDialogOpenRef = useRef(isAlertDialogOpen);
  useEffect(() => {
    if (wasAlertDialogOpenRef.current && !isAlertDialogOpen) {
      releasePublishActionIfActive();
    }
    wasAlertDialogOpenRef.current = isAlertDialogOpen;
  }, [isAlertDialogOpen]);

  const goBack = () => {
    window.location.href = import.meta.env.VITE_WORKSPACE_PATH;
  };
  const isViewTenant = userSession?.access_mode == "read_only";
  return (
    <HeaderContainer>
      <Header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-0">
        <div className="flex min-w-0 items-center gap-2 text-ink">
          {/* Back Button */}
          <Tooltip content="Back to Workspace">
            <Button
              size="icon7"
              variant="ghost"
              className="shrink-0"
              aria-label="Back to Workspace"
              onClick={() => goBack()}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Tooltip>

          {/* App Logo */}
          <AppLogo label={headerLabel} />

          {/* separator */}
          <span className="rotate-12 text-line-strong">/</span>

          {/* Agent name */}
          <AgentName className={isViewTenant ? "max-w-56" : ""} />

          {/* Version selector */}
          {!isAgentHistory && !isExecutionLog ? <FlowVersions /> : <ViewOnlyVersionSelector />}
          {isViewTenant && <TenantSwitchBadge />}
        </div>
        <div className="flex min-w-0 shrink-0 items-center justify-center gap-2">
          <StudioViewSwitch />
          {userSession?.deploymentType == "Commercial" ? <AvailableCredits /> : null}{" "}
        </div>
        {!isAgentHistory && !isExecutionLog ? (
          <div className="flex min-w-0 items-center justify-end">
            <div className="mr-2 flex min-w-0 items-center gap-1 text-ink">
              <PresenceAvatars />

              {!isChatAgent && <SearchCommandTrigger />}

              {!isChatAgent && import.meta.env.MODE !== "production" ? <SettingsTrigger /> : null}

              {!isChatAgent && <StudioPreferences className="mt-0 mlg:mt-4" />}
              <Chat className="mt-0 mlg:mt-4" />
            </div>
            <div className="flex items-center gap-2">
              <SaveFlow />
              <ExecuteFlow />
              <PublishFlow />
              <HeaderActionMenu />
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-center justify-end gap-1">
            {!isChatAgent && <SearchCommandTrigger />}
            <Badge variant="outline" className="shrink-0">
              View only
            </Badge>
            {isAgentHistory && <VersionHistoryCloseButton />}{" "}
          </div>
        )}
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
