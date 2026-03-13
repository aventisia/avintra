import { AvailableCredits } from "@/features/available-credits/AvailableCredits";
import { ExecuteFlow } from "@/features/execute-flow";
import { FlowComments } from "@/features/flow-comments/components/FlowComments";
import { SettingsTrigger } from "@/features/flow-settings/components/SettingsTrigger";
import { FlowVersions } from "@/features/flow-versions/components";
import SaveFlow from "@/features/react-flow/components/save-flow/SaveFlow";
import { FlowParticipantsFacePile } from "@/features/share-access/components/share-avatars/FlowParticipantsFacePile";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { VersionHistoryCloseButton } from "@/features/version-history/components/version-history-panel/VersionHistoryCloseButton";
import { VersionHistoryTrigger } from "@/features/version-history/components/version-history-panel/VersionHistoryTrigger";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { DefaultTenantsEnum } from "@/react-toolkit/enums/default-tenants-enum";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { Button } from "@aventisia/ui/buttons";
import { Header, HeaderContainer } from "@aventisia/ui/layout";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import AgentName from "./AgentName";
import { AppLogo } from "./AppLogo";
import SearchCommandTrigger from "./Search";
import { HeaderActionMenu } from "./header-menu-actions";

const AppHeader: React.FC = () => {
  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isIndividualUser =
    userSession?.tenantName === DefaultTenantsEnum.IndividualUsers;

  const isAgentHistory = useIsVersionHistoryRoute();

  const goBack = () => {
    window.location.href = `${import.meta.env.VITE_WORC_PATH}`;
  };

  return (
    <HeaderContainer className="bg-slate-200">
      <Header>
        <div className="flex w-2/5 items-center gap-3 text-white">
          {/* Back Button */}
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

          {/* App Logo */}
          <AppLogo />

          {/* separator */}
          <span className="rotate-12 text-white/50">/</span>

          {/* Agent name */}
          <AgentName />

          {/* Version selector */}
          <FlowVersions />
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
            <SaveFlow />
            <div className="flex items-center">
              <Tooltip content="More">
                <HeaderActionMenu />
              </Tooltip>
            </div>
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
