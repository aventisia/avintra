import { type ToolCallMessagePartProps, useAuiState } from "@assistant-ui/react";
import { humanizeToolLabel } from "@avplatform/assistant-chat";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@avplatform/ui/collapsible";
import { cn } from "@avplatform/ui/lib";
import {
  BrainIcon,
  CaretRightIcon,
  CheckIcon,
  CircleNotchIcon,
  LightningIcon,
  ProhibitIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";

import { describeActivity } from "../utils/activity-label.util";

type ChatActivityProps = { indices: readonly number[]; children: ReactNode };

/**
 * A run of reasoning, skill and tool steps shown as one quiet line (the live
 * step, then a tally) that opens into a timeline of the steps.
 */
export const ChatActivity = ({ indices, children }: ChatActivityProps) => {
  const [open, setOpen] = useState(false);
  const isActive = useAuiState(
    (s) => s.message.status?.type === "running" && indices.at(-1) === s.message.content.length - 1,
  );
  const label = useAuiState((s) =>
    describeActivity(
      indices.flatMap((index) => s.message.content[index] ?? []),
      isActive,
    ),
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="my-1.5">
      <CollapsibleTrigger className="group/activity -ml-1 inline-flex max-w-full items-center gap-2 rounded-lg px-1 py-1 text-sm text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        {isActive && (
          <span
            aria-hidden
            className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary motion-reduce:animate-none"
          />
        )}
        <span className={cn("truncate", isActive && "animate-pulse motion-reduce:animate-none")}>
          {label}
          {isActive && "…"}
        </span>
        <CaretRightIcon
          weight="bold"
          className="size-3 shrink-0 transition-transform group-data-[state=open]/activity:rotate-90 motion-reduce:transition-none"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="ml-[0.45rem] mt-1 border-l border-line pb-1 pl-5 duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none">
          {children}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
};

const ActivityStep = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: ReactNode;
  children?: ReactNode;
}) => (
  <li className="relative py-1.5">
    <span className="absolute -left-[1.9rem] top-2 flex size-5 items-center justify-center bg-surface text-muted-foreground dark:bg-bg [&>svg]:size-3.5">
      {icon}
    </span>
    <div className="text-sm leading-6 text-ink-2">{label}</div>
    {children}
  </li>
);

export const ChatReasoningStep = ({ text }: { text: string }) => (
  <ActivityStep icon={<BrainIcon />} label="Reasoning">
    <p className="whitespace-pre-wrap pb-1 text-sm leading-6 text-muted-foreground">{text}</p>
  </ActivityStep>
);

export const ChatSkillStep = ({ name }: { name: string }) => (
  <ActivityStep
    icon={<LightningIcon />}
    label={
      <>
        Skill: <span className="font-medium text-ink">{name}</span>
      </>
    }
  />
);

const formatValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
};

const StepDetail = ({
  label,
  text,
  isError,
}: {
  label: string;
  text: string;
  isError?: boolean;
}) => (
  <div className="mt-2">
    <div className={cn("mb-1 text-xs font-medium", isError ? "text-bad" : "text-muted-foreground")}>
      {label}
    </div>
    <pre
      className={cn(
        "max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-sunken px-3 py-2 font-mono text-xs leading-5 dark:bg-fill",
        isError ? "border-bad/30 text-bad" : "border-line text-ink-2",
      )}
    >
      {text}
    </pre>
  </div>
);

type ChatToolStepProps = Pick<
  ToolCallMessagePartProps,
  "toolName" | "args" | "result" | "isError" | "status"
>;

export const ChatToolStep = ({ toolName, args, result, isError, status }: ChatToolStepProps) => {
  const isRunning = status.type === "running";
  const isCancelled = status.type === "incomplete" && status.reason === "cancelled";
  const hasFailed = isError || (status.type === "incomplete" && status.reason === "error");
  const input = Object.keys(args ?? {}).length > 0 ? formatValue(args) : null;
  const output = formatValue(result);

  return (
    <ActivityStep
      icon={
        isRunning ? (
          <CircleNotchIcon className="animate-spin text-primary motion-reduce:animate-none" />
        ) : hasFailed ? (
          <WarningIcon className="text-bad" />
        ) : isCancelled ? (
          <ProhibitIcon />
        ) : (
          <CheckIcon weight="bold" className="text-ok" />
        )
      }
      label={humanizeToolLabel(toolName)}
    >
      {(input || output) && (
        <details className="group/details pb-1">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded text-xs text-muted-foreground hover:text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&::-webkit-details-marker]:hidden">
            <CaretRightIcon className="size-3 transition-transform group-open/details:rotate-90" />
            Details
          </summary>
          {input && <StepDetail label="Input" text={input} />}
          {output && (
            <StepDetail label={hasFailed ? "Error" : "Output"} text={output} isError={hasFailed} />
          )}
        </details>
      )}
    </ActivityStep>
  );
};
