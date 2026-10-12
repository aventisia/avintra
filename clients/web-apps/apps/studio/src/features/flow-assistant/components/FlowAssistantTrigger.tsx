import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { Panel } from "@xyflow/react";
import { SparklesIcon, XIcon } from "lucide-react";

import { FLOW_ASSISTANT_COPY } from "../constants";
import { useFlowAssistantStore } from "../stores/flow-assistant-store";

export const FlowAssistantTrigger = () => {
  const isPanelOpen = useFlowAssistantStore((state) => state.isPanelOpen);
  const hasProposal = useFlowAssistantStore((state) => state.pendingProposal !== null);
  const togglePanel = useFlowAssistantStore((state) => state.togglePanel);

  return (
    <Panel position="top-right" className="!m-3">
      <Tooltip content={isPanelOpen ? "Close assistant" : FLOW_ASSISTANT_COPY.triggerLabel}>
        <Button
          type="button"
          variant={isPanelOpen ? "secondary" : "default"}
          size="icon9"
          className={cn("relative rounded-full shadow-md", hasProposal && "ring-2 ring-primary/40")}
          onClick={togglePanel}
          aria-label={FLOW_ASSISTANT_COPY.triggerLabel}
          aria-pressed={isPanelOpen}
        >
          {isPanelOpen ? <XIcon className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
          {hasProposal && !isPanelOpen && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </Button>
      </Tooltip>
    </Panel>
  );
};
