import { Header, HeaderContainer } from "@avplatform/layout";
import { Button } from "@avplatform/ui/buttons";
import { useAlertDialogStore, useBrandingStore, useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { AvailableCredits } from "@/features/available-credits/AvailableCredits";
import { Chat } from "@/features/collaboration/components/Chat";
import { PresenceAvatars } from "@/features/collaboration/components/PresenceAvatars";
import { releasePublishActionIfActive } from "@/features/collaboration/hooks/useCollaboration";
import { ExecuteFlow } from "@/features/execute-flow";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { SettingsTrigger } from "@/features/flow-settings/components/SettingsTrigger";
import { FlowVersions } from "@/features/flow-versions/components";
import SaveFlow from "@/features/react-flow/components/save-flow/SaveFlow";
import { StudioPreferences } from "@/features/studio-preferences/components";
import {
  UiBuilderPublishButton,
  UiBuilderVersions,
  useIsUiBuilderRoute,
} from "@/features/ui-builder";
import { VersionHistoryCloseButton } from "@/features/version-history/components/version-history-panel/VersionHistoryCloseButton";
import { VersionHistoryTrigger } from "@/features/version-history/components/version-history-panel/VersionHistoryTrigger";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import AgentName from "./AgentName";
import { AppLogo } from "./AppLogo";
import SearchCommandTrigger from "./Search";
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
  const isUiBuilder = useIsUiBuilderRoute();
  const serverBranding = useBrandingStore((state) => state.branding);
  const headerLabel =
    serverBranding?.appName ||
    (serverBranding && Object.values(serverBranding).some((value) => !!value)
      ? "Agent Builder"
      : undefined);

  // ChatAgent flows hide search, flow settings, and studio preferences.
  const isChatAgent = useCurrentFlowStore((state) => state.isChatAgent);

  // Persistent watcher for the publish alert dialog close. The Publish button lives inside
  // a dropdown that unmounts when closed, so this header component watches the alert dialog
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
    <HeaderContainer className="bg-slate-200">
      <Header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-0">
        <div className="flex min-w-0 items-center gap-3 text-primary-foreground">
          {/* Back Button */}
          <Tooltip content="Back to Workspace">
            <Button
              size="icon8"
              variant="ghost"
              className="shrink-0 hover:bg-primary-foreground/10"
              onClick={() => goBack()}
            >
              <ArrowLeftIcon className="h-4 w-4 text-primary-foreground/80" />
            </Button>
          </Tooltip>

          {/* App Logo */}
          <AppLogo label={headerLabel} />

          {/* separator */}
          <span className="rotate-12 text-primary-foreground/50">/</span>

          {/* Agent name */}
          {!isUiBuilder && <AgentName className={isViewTenant ? "max-w-56" : ""} />}

          {/* Version selector */}
          {isUiBuilder ? (
            <UiBuilderVersions />
          ) : !isAgentHistory && !isExecutionLog ? (
            <FlowVersions />
          ) : (
            <ViewOnlyVersionSelector />
          )}
          {isViewTenant && <TenantSwitchBadge />}
        </div>
        <div className="flex min-w-0 shrink-0 items-center justify-center">
          {userSession?.deploymentType == "Commercial" ? <AvailableCredits /> : null}{" "}
        </div>
        {!isAgentHistory && !isExecutionLog ? (
          <div className="flex min-w-0 items-center justify-end">
            {isUiBuilder ? (
              <div className="flex min-w-0 items-center gap-2">
                <StudioPreferences className="mt-0 mlg:mt-4" />
                <UiBuilderPublishButton />
              </div>
            ) : (
              <>
                <div className="mx-4 flex min-w-0 items-center gap-1 text-primary-foreground">
              <PresenceAvatars />

                  <ExecuteFlow />

                  {!isChatAgent && <SearchCommandTrigger />}

                  <VersionHistoryTrigger />

                  {!isChatAgent && import.meta.env.MODE !== "production" ? (
                    <SettingsTrigger />
                  ) : null}

                  {!isChatAgent && <StudioPreferences className="mt-0 mlg:mt-4" />}
                  <Chat className="mt-0 mlg:mt-4" />
                </div>
                <SaveFlow />
                <div className="flex items-center">
                  <HeaderActionMenu />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex min-w-0 items-center justify-end gap-1">
            {!isChatAgent && <SearchCommandTrigger />}
            <Button
              variant={"ghost"}
              size={"xs"}
              className={
                "group flex h-7 max-w-[15rem] shrink-0 gap-2 rounded-full bg-primary-foreground/10 pl-3 pr-2.5 font-bold text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground/80"
              }
            >
              View Only
            </Button>
            {isAgentHistory && <VersionHistoryCloseButton />}{" "}
          </div>
        )}
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
