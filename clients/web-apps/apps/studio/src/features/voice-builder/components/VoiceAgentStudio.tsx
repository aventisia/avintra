import { LoadingSpinner } from "@avplatform/ui";

import { FlowActionLockBanner, ViewOnlyBanner } from "@/features/collaboration";
import { ReactFlowDialogWrapper } from "@/features/react-flow/components/ReactFlowDialogWrapper";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import type { VoiceEngineMode } from "../types/voice-builder.type";
import { VoiceBuilder } from "./VoiceBuilder";
import { VoiceTestConsole } from "./VoiceTestConsole";

type VoiceAgentStudioProps = {
  isLoading: boolean;
  engineMode?: VoiceEngineMode;
  modelLabel?: string;
};

/** Voice agent build view: the settings page beside the test call, in place of the canvas. */
export const VoiceAgentStudio = ({ isLoading, engineMode, modelLabel }: VoiceAgentStudioProps) => (
  <ResizablePanelGroup orientation="horizontal" className="!bg-bg">
    <ResizablePanel defaultSize="50%" minSize="35%" className="overflow-hidden bg-surface">
      <div className="relative h-full w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner label="Loading the agent" className="size-6 text-primary" />
          </div>
        ) : (
          <VoiceBuilder />
        )}
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <FlowActionLockBanner />
          <ViewOnlyBanner />
        </div>
      </div>
      <ReactFlowDialogWrapper />
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize="50%" minSize="30%" className="overflow-hidden">
      <VoiceTestConsole engineMode={engineMode} modelLabel={modelLabel} />
    </ResizablePanel>
  </ResizablePanelGroup>
);
