import { Header, HeaderContainer } from "@avplatform/layout";
import { Button } from "@avplatform/ui/buttons";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { AvailableCredits } from "@/features/available-credits/AvailableCredits";
import { ExecuteFlow } from "@/features/execute-flow";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { FlowComments } from "@/features/flow-comments/components/FlowComments";
import { SettingsTrigger } from "@/features/flow-settings/components/SettingsTrigger";
import { FlowVersions } from "@/features/flow-versions/components";
import SaveFlow from "@/features/react-flow/components/save-flow/SaveFlow";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { VersionHistoryCloseButton } from "@/features/version-history/components/version-history-panel/VersionHistoryCloseButton";
import { VersionHistoryTrigger } from "@/features/version-history/components/version-history-panel/VersionHistoryTrigger";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

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

  // const isIndividualUser =
  //   userSession?.tenantName === DefaultTenantsEnum.IndividualUsers;

  const isAgentHistory = useIsVersionHistoryRoute();
  const isExecutionLog = useIsExecutionLogsRoute();

  const [searchParams] = useSearchParams();
  const showBackButton = searchParams.get("return") === "1";

  const goBack = () => {
    window.location.href = import.meta.env.VITE_WORKSPACE_PATH;
  };
  const isViewTenant = userSession?.access_mode == "read_only";
  return (
    <HeaderContainer className="bg-slate-200">
      <Header className="grid p-0 grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-3 min-w-0 text-white">
          {/* Back Button */}
          {showBackButton && (
            <Tooltip content="Back to Avintra">
              <Button
                size="icon8"
                variant="ghost"
                className="hover:bg-white/10"
                onClick={() => goBack()}
              >
                <ArrowLeftIcon className="h-4 w-4 text-white/80" />
              </Button>
            </Tooltip>
          )}

          {/* App Logo */}
          <AppLogo />

          {/* separator */}
          <span className="rotate-12 text-white/50">/</span>

          {/* Agent name */}
          <AgentName className={isViewTenant ? "max-w-56" : ""} />

          {/* Version selector */}
          {!isAgentHistory && !isExecutionLog ? <FlowVersions /> : <ViewOnlyVersionSelector />}
          {isViewTenant && <TenantSwitchBadge />}
        </div>
        <div className="flex items-center justify-center ">
          {userSession?.deploymentType == "Commercial" ? <AvailableCredits /> : null}{" "}
        </div>
        {!isAgentHistory && !isExecutionLog ? (
          <div className="flex items-center  justify-end">
            {/* <div>
              {isIndividualUser ? (
                <Avatar className={cn("flex h-7 w-7")}>
                  <AvatarFallback className="bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary">
                    {userSession ? userSession?.userInitials : "--"}
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div> */}
            <div className="mx-4 flex items-center gap-1 text-white">
              <ExecuteFlow />

              <SearchCommandTrigger />

              <VersionHistoryTrigger />

              {import.meta.env.MODE !== "production" ? <SettingsTrigger /> : null}

              <StudioPreferences className="mt-0 mlg:mt-4" />
              <FlowComments className="mt-0 mlg:mt-4" />
            </div>
            <SaveFlow />
            <div className="flex items-center">
              <HeaderActionMenu />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 justify-end">
            <SearchCommandTrigger />
            <Button
              variant={"ghost"}
              size={"xs"}
              className={
                "group flex h-7 max-w-[15rem] gap-2 rounded-full bg-white/10 pl-3 pr-2.5 font-bold text-white/80 hover:bg-white/20 hover:text-white/80"
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
