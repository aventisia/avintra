import { LoadingSpinner } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, XIcon } from "lucide-react";

import { CustomNodeType } from "@/types/custom-node-type";

import { NodeRunState } from "./useNodeRunState";

const nodeKindLookup: Partial<Record<CustomNodeType, string>> = {
  triggerNode: "Trigger",
  ifElseNode: "Condition",
  conditionalNode: "Condition",
  whileLoopNode: "Loop",
  forLoopNode: "Loop",
  forEachLoopNode: "Loop",
  breakLoopNode: "Loop",
  continueLoopNode: "Loop",
  aiNode: "AI",
  blockNode: "Block",
  callAgentNode: "Agent",
  flowExitNode: "Exit",
};

export const getNodeKind = (type?: CustomNodeType) => (type && nodeKindLookup[type]) || "Action";

const runStateLabel: Record<NodeRunState, string> = {
  idle: "Not started",
  running: "Running",
  success: "Completed",
  failed: "Failed",
};

interface NodeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  runState: NodeRunState;
  selected?: boolean;
}

/** 220×60 Ink step card frame; border follows the run state, selection adds the select ring. */
export const NodeCard = ({ runState, selected, className, ...props }: NodeCardProps) => (
  <div
    className={cn(
      "custom-drag-handle relative flex h-[60px] w-[220px] rounded-md border border-line-strong bg-surface text-ink",
      runState === "running" && "border-live",
      runState === "failed" && "border-bad",
      selected && "shadow-select",
      className,
    )}
    {...props}
  />
);

interface NodeCardContentProps {
  glyph: React.ReactNode;
  kind: React.ReactNode;
  title: string;
  runState: NodeRunState;
}

export const NodeCardContent = ({ glyph, kind, title, runState }: NodeCardContentProps) => (
  <>
    <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-sunken text-ink-2 [&>div]:contents [&_img]:size-4 [&_svg]:size-4 [&_svg]:text-ink-2">
      {glyph}
    </span>
    <span className="grid min-w-0 flex-1 text-left">
      <span className="truncate font-mono text-label uppercase text-muted-foreground">{kind}</span>
      <span className="truncate text-[13.5px] font-semibold leading-[18px] text-ink" title={title}>
        {title}
      </span>
    </span>
    <NodeStateMark state={runState} />
  </>
);

export const NodeStateMark = ({ state }: { state: NodeRunState }) => (
  <span
    role="img"
    aria-label={runStateLabel[state]}
    className={cn(
      "grid size-5 shrink-0 place-items-center rounded-full",
      state === "idle" && "border-[1.5px] border-dashed border-line-strong",
      state === "success" && "bg-ok text-surface",
      state === "failed" && "bg-bad text-on-bad",
      state === "running" && "text-live",
    )}
  >
    {state === "running" && <LoadingSpinner className="size-3.5" />}
    {state === "success" && <CheckIcon className="size-3" strokeWidth={3} />}
    {state === "failed" && <XIcon className="size-3" strokeWidth={3} />}
  </span>
);
