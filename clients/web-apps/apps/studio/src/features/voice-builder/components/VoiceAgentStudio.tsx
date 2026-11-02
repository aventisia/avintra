import { LoadingSpinner } from "@avplatform/ui";

import { FlowActionLockBanner } from "@/features/collaboration/components/FlowActionLockBanner";
import { ReactFlowDialogWrapper } from "@/features/react-flow/components/ReactFlowDialogWrapper";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { VoiceBuilder } from "./VoiceBuilder";
import { VoiceTestConsole } from "./VoiceTestConsole";

type VoiceAgentStudioProps = {
  isLoading: boolean;
  modelLabel?: string;
};

/** Voice agent build view: the settings page beside the test call, in place of the canvas. */
export const VoiceAgentStudio = ({ isLoading, modelLabel }: VoiceAgentStudioProps) => (
  <ResizablePanelGroup orientation="horizontal" className="!bg-bg p-1.5">
    <ResizablePanel
      defaultSize="60%"
      minSize="35%"
      className="overflow-hidden rounded-xl bg-surface"
    >
      <div className="relative h-full w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner className="size-6 text-primary" />
          </div>
        ) : (
          <VoiceBuilder />
        )}
        <FlowActionLockBanner />
      </div>
      <ReactFlowDialogWrapper />
    </ResizablePanel>
    <ResizableHandle withHandle className="mr-px w-1.5 bg-transparent" />
    <ResizablePanel defaultSize="40%" minSize="30%" className="overflow-hidden rounded-xl">
      <VoiceTestConsole modelLabel={modelLabel} />
    </ResizablePanel>
  </ResizablePanelGroup>
);
