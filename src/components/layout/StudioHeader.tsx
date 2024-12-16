import { ExecuteFlow } from "@/features/execute-flow/ExecuteFlow";
import FlowLogHeader from "@/features/flow-logs/components/FlowLogHeader";
import { FlowsPopover } from "@/features/flows-popover/components/FlowsPopover";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { DotSeparator } from "@/react-toolkit/ui/custom/DotSeparator";
import { Separator } from "@/react-toolkit/ui/separator";
import { Panel } from "@xyflow/react";

const StudioHeader = () => {
  return (
    <>
      <Panel position="top-left" onContextMenu={(e) => e.preventDefault()}>
        <div className="flex h-10 items-center rounded-lg bg-white pl-2">
          <AppLogo className="h-6 text-sm font-bold" />
          <DotSeparator className="ml-[0.9rem] mr-[0.1rem]" />
          <FlowsPopover className="mt-0 mlg:mt-0" />
        </div>
      </Panel>
      <Panel position="top-right" onContextMenu={(e) => e.preventDefault()}>
        <div className="flex h-10 items-center gap-2 rounded-lg bg-white px-1.5">
          <ExecuteFlow />
          <Separator orientation="vertical" className="h-6" />
          <FlowLogHeader />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            <StudioPreferences />
            <UnreadNotifications
              className="mt-0 mlg:mt-1.5"
              triggerSize="icon7"
            />
          </div>
          <UserAccountModal
            className="-mr-1.5 mt-1.5"
            sizeClassName="h-7 w-7"
          />
        </div>
      </Panel>
    </>
  );
};

export { StudioHeader };
