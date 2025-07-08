import { ExecuteFlow } from "@/features/execute-flow";
import { FlowComments } from "@/features/flow-comments/components/FlowComments";
import { FlowVersions } from "@/features/flow-versions/components";
import { PublishFlow } from "@/features/publish-flow/PublishFlow";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
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

const AppHeader: React.FC = () => {
  // Get global store state and actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      isFlowSaving: state.isFlowSaving,
    })),
  );

  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isAssist = useIsAgentsAssist();

  const goBack = () => {
    window.location.href = `${import.meta.env.VITE_WORKSPACE_URL}/agents`;
  };

  return (
    <HeaderContainer className="bg-slate-200">
      <Header>
        <div className="flex flex-grow items-center gap-3 text-white">
          {/* Back Button */}
          {!isAssist && (
            <Tooltip content="Back">
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
          {!isAssist && (
            <span className="truncate text-xs">{currentFlow.name}</span>
          )}
          {/* Version selector */}
          {!isAssist && <FlowVersions />}{" "}
        </div>
        <div>
          <Avatar className={cn("flex h-7 w-7")}>
            <AvatarFallback className="bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary">
              {userSession ? userSession?.userInitials : "--"}
            </AvatarFallback>
          </Avatar>
        </div>
        {!isAssist && (
          <div className="mx-4 flex items-center gap-1 text-white">
            <ExecuteFlow />

            <SearchCommandTrigger />
            {import.meta.env.MODE !== "production" ? <SettingsTrigger /> : null}

            {import.meta.env.MODE !== "production" ? (
              <StudioPreferences className="mt-0 mlg:mt-4" />
            ) : null}
            <FlowComments className="mt-0 mlg:mt-4" />
          </div>
        )}
        {!isAssist && import.meta.env.MODE !== "production" ? (
          <PublishFlow />
        ) : null}
        {!isAssist && (
          <Tooltip content="More">
            <HeaderActionMenu />
          </Tooltip>
        )}
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
