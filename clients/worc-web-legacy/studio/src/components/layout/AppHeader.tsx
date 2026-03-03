import { ExecuteFlow } from "@/features/execute-flow";
import { FlowComments } from "@/features/flow-comments/components/FlowComments";
import { FlowVersions } from "@/features/flow-versions/components";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { Button } from "@aventisia/ui/buttons";
import { Header, HeaderContainer } from "@aventisia/ui/layout";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { AppLogo } from "./AppLogo";
import { HeaderActionMenu } from "./header-menu-actions";
import SearchCommandTrigger from "./Search";
import { SettingsTrigger } from "@/features/flow-settings/components/SettingsTrigger";
import { useIsAgentsAssist } from "@/features/agents-assist/hooks/useIsAgentsAssist";
import { FlowParticipantsFacePile } from "@/features/share-access/components/share-avatars/FlowParticipantsFacePile";
import { DefaultTenantsEnum } from "@/react-toolkit/enums/default-tenants-enum";
import AgentName from "./AgentName";
import { AvailableCredits } from "@/features/available-credits/AvailableCredits";
import SaveFlow from "@/features/react-flow/components/save-flow/SaveFlow";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { VersionHistoryTrigger } from "@/features/version-history/components/version-history-panel/VersionHistoryTrigger";
import { VersionHistoryCloseButton } from "@/features/version-history/components/version-history-panel/VersionHistoryCloseButton";

const AppHeader: React.FC = () => {
  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isIndividualUser =
    userSession?.tenantName === DefaultTenantsEnum.IndividualUsers;

  const isAssist = useIsAgentsAssist();
  const isAgentHistory = useIsVersionHistoryRoute();

  const goBack = () => {
    window.location.href = `${import.meta.env.VITE_WORC_PATH}`;
  };

  return (
    <HeaderContainer className="bg-slate-200">
      <Header>
        <div className="flex w-2/5 items-center gap-3 text-white">
          {/* Back Button */}
          {!isAssist && (
            <Tooltip content="Back to Worc">
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
          {!isAssist && <span className="rotate-12 text-white/50">/</span>}
          {/* Agent name */}
          {!isAssist && <AgentName />}
          {/* Version selector */}
          {!isAssist && <FlowVersions />}{" "}
        </div>
        <div className="flex w-1/5 justify-center">
          {userSession?.deploymentType == "Commercial" ? (
            <AvailableCredits />
          ) : null}{" "}
        </div>
        {!isAgentHistory ? (
          <div className="flex w-2/5 justify-end">
            <div>
              {isIndividualUser ? (
                <Avatar className={cn("flex h-7 w-7")}>
                  <AvatarFallback className="bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary">
                    {userSession ? userSession?.userInitials : "--"}
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>
            {!isAssist && (
              <div className="mx-4 flex items-center gap-1 text-white">
                {!isIndividualUser ? <FlowParticipantsFacePile /> : null}

                <ExecuteFlow />

                <SearchCommandTrigger />

                <VersionHistoryTrigger />

                {import.meta.env.MODE !== "production" ? (
                  <SettingsTrigger />
                ) : null}

                <StudioPreferences className="mt-0 mlg:mt-4" />
                <FlowComments className="mt-0 mlg:mt-4" />
              </div>
            )}
            <SaveFlow />
            {!isAssist && (
              <div className="flex items-center">
                <Tooltip content="More">
                  <HeaderActionMenu />
                </Tooltip>
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-2/5 items-center justify-end gap-1">
            <Button
              variant={"ghost"}
              size={"xs"}
              className={
                "group flex h-7 max-w-[15rem] gap-2 rounded-full bg-white/10 pl-3 pr-2.5 font-bold text-white/80 hover:bg-white/20 hover:text-white/80"
              }
            >
              View Only
            </Button>
            <VersionHistoryCloseButton />
          </div>
        )}
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
