import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { Tooltip } from "@aventisia/ui/tooltip";
import { HeaderActionMenu } from "./header-menu-actions";
import { FlowComments } from "@/features/flow-comments/components/FlowComments";
import SearchCommandDialog from "./Search";
import { ExecuteFlow } from "@/features/execute-flow/ExecuteFlow";

const RightHeaderSection = () => {
  // Get user session state and actions
  const { userSession } = useUserSessionStore();

  return (
    <div className="flex items-center">
      <Avatar className={"flex h-7 w-7"}>
        <AvatarFallback className="bg-[#aba7e7] font-bold capitalize tracking-wider text-secondary">
          {userSession ? userSession?.userInitials : "--"}
        </AvatarFallback>
      </Avatar>
      <Separator
        orientation="vertical"
        className="ml-3 mr-0.5 h-6 w-[0.1px] bg-white/10"
      />
      <div className="mx-1.5 flex items-center">
        <ExecuteFlow />
        <SearchCommandDialog />
        <StudioPreferences />
        <FlowComments />
      </div>
      <Tooltip content="Publish">
        <Button size={"xs"} className="mx-0.5 hover:bg-white/10">
          Publish{" "}
        </Button>
      </Tooltip>
      <HeaderActionMenu />
    </div>
  );
};

export default RightHeaderSection;
