import { Header, HeaderContainer } from "@avplatform/layout";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { useAlertDialogStore, useUserSessionStore } from "@avplatform/ui/stores";
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
import { FlowVersions } from "@/features/flow-versions/components";
import { FLOW_TYPE_LABELS } from "@/features/flow-versions/constants";
import { PublishFlow } from "@/features/publish-flow/PublishFlow";
import SaveFlow from "@/features/react-flow/components/save-flow/SaveFlow";
import { VersionHistoryCloseButton } from "@/features/version-history/components/version-history-panel/VersionHistoryCloseButton";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import AgentName from "./AgentName";
import { AppLogo } from "./AppLogo";
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
  const isCanvas = !isAgentHistory && !isExecutionLog;
  const isPublished = useReactFlowExtStore((state) => state.isPublished);
  const flowType = useReactFlowExtStore((state) => state.flowType);

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
    <HeaderContainer className="p-0">
      <Header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-surface pl-1.5 pr-2">
        <div className="flex min-w-0 items-center gap-2.5 text-ink">
          <Tooltip content="Back to Workspace">
            <Button
              size="icon8"
              variant="ghost"
              className="shrink-0"
              aria-label="Back to Workspace"
              onClick={() => goBack()}
            >
              <ArrowLeftIcon className="size-[17px]" />
            </Button>
          </Tooltip>

          <AppLogo markOnly className="h-[22px]" />

          <div className="flex min-w-0 items-center gap-0.5">
            <div className="flex min-w-0 flex-col">
              <div className="flex min-w-0 items-center gap-1.5 pl-[7px]">
                <span className="truncate text-[11px] font-semibold uppercase leading-3 tracking-[0.1em] text-primary">
                  {FLOW_TYPE_LABELS[flowType]}
                </span>
                {isCanvas ? <SaveFlow /> : null}
              </div>
              {isCanvas ? (
                <FlowVersions />
              ) : (
                <AgentName className={isViewTenant ? "max-w-56" : ""} />
              )}
            </div>
            {isCanvas ? null : <ViewOnlyVersionSelector />}
          </div>

          {isCanvas && isPublished ? (
            <Badge variant="completed" className="shrink-0">
              Published
            </Badge>
          ) : null}
          {isViewTenant && <TenantSwitchBadge />}
        </div>

        <StudioViewSwitch />

        <div className="flex min-w-0 items-center justify-end gap-3">
          {isCanvas ? (
            <>
              <div className="flex items-center gap-1">
                <PresenceAvatars />
                <Chat className="mt-0 mlg:mt-4" />
              </div>
              {userSession?.deploymentType == "Commercial" ? <AvailableCredits /> : null}
              <div className="ml-3 flex items-center gap-2">
                <ExecuteFlow />
                <PublishFlow />
                <HeaderActionMenu />
              </div>
            </>
          ) : (
            <>
              {userSession?.deploymentType == "Commercial" ? <AvailableCredits /> : null}
              <Badge variant="outline" className="shrink-0">
                View only
              </Badge>
              {isAgentHistory && <VersionHistoryCloseButton />}
            </>
          )}
        </div>
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
