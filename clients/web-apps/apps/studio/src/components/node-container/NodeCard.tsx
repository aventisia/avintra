import { LoadingSpinner } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, XIcon } from "@phosphor-icons/react";

import { CustomNodeType } from "@/types/custom-node-type";

import { NodeHeading } from "./node-header/NodeHeading";
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

export type NodeShape = "square" | "circle" | "wide";

// IMPORTANT NOTE: These are the pre-ink node sizes; existing flows are laid out for them, so keep them until the dedicated node-size issue changes them.
const shapeClass: Record<NodeShape, string> = {
  square: "size-16 rounded-lg",
  circle: "size-16 rounded-full",
  wide: "h-16 w-48 rounded-lg",
};

interface NodeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  runState: NodeRunState;
  selected?: boolean;
  shape?: NodeShape;
}

/** Ink node frame in its legacy shape; border follows the run state, selection adds the select ring. */
export const NodeCard = ({
  runState,
  selected,
  shape = "square",
  className,
  ...props
}: NodeCardProps) => (
  <div
    className={cn(
      "custom-drag-handle relative flex border border-line-strong bg-surface text-ink",
      shapeClass[shape],
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
  shape?: NodeShape;
}

export const NodeCardContent = ({
  glyph,
  kind,
  title,
  runState,
  shape = "square",
}: NodeCardContentProps) =>
  shape === "wide" ? (
    <>
      <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-sunken text-ink-2 [&>div]:contents [&_img]:size-4 [&_svg]:size-4 [&_svg]:text-ink-2">
        {glyph}
      </span>
      <span className="grid min-w-0 flex-1 text-left">
        <span className="truncate font-mono text-label uppercase text-muted-foreground">
          {kind}
        </span>
        <span
          className="truncate text-[13.5px] font-semibold leading-[18px] text-ink"
          title={title}
        >
          {title}
        </span>
      </span>
      <NodeStateMark state={runState} />
    </>
  ) : (
    <>
      <span className="grid place-items-center text-ink-2 [&>div]:contents [&_img]:size-7 [&_svg]:size-6 [&_svg]:text-ink-2">
        {glyph}
      </span>
      <NodeHeading className="left-1/2 -translate-x-1/2">{title}</NodeHeading>
      {runState !== "idle" && (
        <NodeStateMark
          state={runState}
          className="absolute -right-1.5 -top-1.5 size-4 bg-surface"
        />
      )}
    </>
  );

export const NodeStateMark = ({
  state,
  className,
}: {
  state: NodeRunState;
  className?: string;
}) => (
  <span
    role="img"
    aria-label={runStateLabel[state]}
    className={cn(
      "grid size-5 shrink-0 place-items-center rounded-full",
      state === "idle" && "border-[1.5px] border-dashed border-line-strong",
      state === "success" && "bg-ok text-surface",
      state === "failed" && "bg-bad text-on-bad",
      state === "running" && "text-live",
      className,
    )}
  >
    {state === "running" && <LoadingSpinner className="size-3.5" />}
    {state === "success" && <CheckIcon className="size-3" weight="bold" />}
    {state === "failed" && <XIcon className="size-3" weight="bold" />}
  </span>
);
