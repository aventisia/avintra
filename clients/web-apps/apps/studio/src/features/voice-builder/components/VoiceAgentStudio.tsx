import { LoadingSpinner } from "@avplatform/ui";

import { FlowActionLockBanner } from "@/features/collaboration/components/FlowActionLockBanner";
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
            <LoadingSpinner className="size-6 text-primary" />
          </div>
        ) : (
          <VoiceBuilder />
        )}
        <FlowActionLockBanner />
      </div>
      <ReactFlowDialogWrapper />
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize="50%" minSize="30%" className="overflow-hidden">
      <VoiceTestConsole engineMode={engineMode} modelLabel={modelLabel} />
    </ResizablePanel>
  </ResizablePanelGroup>
);
