import { Header, HeaderContainer } from "@aventisia/ui/layout";
import { Button } from "@aventisia/ui/buttons";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { AppLogo } from "./AppLogo";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useShallow } from "zustand/react/shallow";
import { Tooltip } from "@aventisia/ui/tooltip";
import { FlowComments } from "@/features/flow-comments/components/FlowComments";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { cn } from "@aventisia/ui/lib";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { ExecuteFlow } from "@/features/execute-flow/ExecuteFlow";

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

  return (
    <HeaderContainer className="bg-slate-200">
      <Header>
        <div className="flex flex-grow items-center gap-3 text-white">
          {/* Back Button */}
          <Tooltip content="Back">
            <Button size="icon8" variant="ghost" className="hover:bg-white/10">
              <ArrowLeftIcon className="h-4 w-4 text-white/80" />
            </Button>
          </Tooltip>

          {/* App Logo */}
          <AppLogo />

          {/* separator */}
          <span className="rotate-12 text-white/50">/</span>

          {/* Agent name */}
          <span className="truncate text-xs">{currentFlow.name}</span>

          {/* Version selector */}
          <Button
            variant={"ghost"}
            size={"xs"}
            className={cn(
              "group flex h-7 max-w-[15rem] gap-2 rounded-full bg-white/10 pl-3 pr-2.5 font-bold text-white/80 hover:bg-white/20 hover:text-white/80",
            )}
          >
            v1
            <ChevronDownIcon
              className={cn(
                "h-3 w-3 min-w-3 transition-all group-hover:mt-0.5",
              )}
            />
          </Button>
        </div>
        <div>
          <Avatar className={cn("flex h-7 w-7")}>
            <AvatarFallback className="bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary">
              {userSession ? userSession?.userInitials : "--"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="mx-4 flex items-center gap-1 text-white">
          <ExecuteFlow />

          <Tooltip content="Search">
            <Button size="icon8" variant="ghost" className="hover:bg-white/10">
              <MagnifyingGlassIcon className="h-[1.1rem] w-[1.1rem] text-white/80" />
            </Button>
          </Tooltip>
          <StudioPreferences className="mt-0 mlg:mt-4" />
          <FlowComments className="mt-0 mlg:mt-4" />
        </div>
        <Button size={"sm"} className="mr-2.5">
          Publish
        </Button>
        <Tooltip content="More">
          <Button size="icon8" variant="ghost" className="hover:bg-white/10">
            <EllipsisVerticalIcon className="h-5 w-5 text-white/80" />
          </Button>
        </Tooltip>
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
