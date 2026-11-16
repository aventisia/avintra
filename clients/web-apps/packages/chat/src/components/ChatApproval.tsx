import { type ToolCallMessagePartProps, useAui, useAuiState } from "@assistant-ui/react";
import { getPendingApprovalParts, humanizeToolLabel } from "@avplatform/assistant-chat";
import { Button } from "@avplatform/ui/buttons";
import {
  CheckIcon,
  CircleNotchIcon,
  HandPalmIcon,
  MinusCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Fragment, useState } from "react";

const DENY_REASON = "User denied this action.";

type ApprovalState = "pending" | "approved" | "denied" | "expired" | "skipped";

const RESOLVED = {
  approved: { text: "Approved", Icon: CheckIcon, className: "text-ok" },
  denied: { text: "Denied", Icon: XIcon, className: "text-bad" },
  expired: { text: "Expired", Icon: MinusCircleIcon, className: "text-muted-foreground" },
  skipped: { text: "Not answered", Icon: MinusCircleIcon, className: "text-muted-foreground" },
} as const;

const resolveState = (
  approval: ToolCallMessagePartProps["approval"],
  isLast: boolean,
): ApprovalState => {
  if (approval?.resolution) return approval.resolution === "cancelled" ? "skipped" : "expired";
  if (approval?.approved !== undefined) return approval.approved ? "approved" : "denied";
  return isLast ? "pending" : "skipped";
};

const formatArg = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value));

type ChatApprovalProps = Pick<
  ToolCallMessagePartProps,
  "toolName" | "args" | "approval" | "respondToApproval"
>;

/**
 * A tool the assistant wants to run once the user approves it. The composer
 * stays usable; sending another message leaves the request unanswered.
 */
export const ChatApproval = ({
  toolName,
  args,
  approval,
  respondToApproval,
}: ChatApprovalProps) => {
  const isLast = useAuiState((s) => s.message.isLast);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null);
  const [failed, setFailed] = useState(false);
  const state = resolveState(approval, isLast);
  const label = humanizeToolLabel(toolName);

  if (state !== "pending") {
    const { text, Icon, className } = RESOLVED[state];
    return (
      <p className="my-1.5 flex items-center gap-2 text-sm text-ink-2">
        <Icon weight="bold" className={`size-3.5 shrink-0 ${className}`} />
        {text}
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <span className="truncate">{label}</span>
      </p>
    );
  }

  const respond = async (approved: boolean) => {
    setSubmitting(approved ? "approve" : "deny");
    setFailed(false);
    try {
      await respondToApproval({ approved, reason: approved ? undefined : DENY_REASON });
    } catch (error) {
      console.error("Failed to respond to tool approval:", error);
      setFailed(true);
    } finally {
      setSubmitting(null);
    }
  };
  const isBusy = submitting !== null || isRunning;
  const entries = Object.entries(args ?? {});

  return (
    <div
      role="group"
      aria-label={`Approval needed: ${label}`}
      className="my-3 rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(0_0_0/0.2)] duration-200 animate-in fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none dark:bg-fill/40"
    >
      <div className="flex items-start gap-3 px-4 pt-3.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-warn/10 text-warn">
          <HandPalmIcon weight="bold" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[0.9375rem] font-medium leading-6 text-ink">{label}</p>
          <p className="text-sm leading-5 text-muted-foreground">Runs only after you approve it.</p>
        </div>
      </div>
      {entries.length > 0 && (
        <dl className="mx-4 mt-3 grid max-h-48 grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1 overflow-y-auto rounded-xl bg-sunken px-3 py-2.5 text-sm leading-6 dark:bg-fill">
          {entries.map(([key, value]) => (
            <Fragment key={key}>
              <dt className="truncate text-muted-foreground first-letter:uppercase">
                {key.replace(/[_-]+/g, " ")}
              </dt>
              <dd className="truncate text-ink" title={formatArg(value)}>
                {formatArg(value)}
              </dd>
            </Fragment>
          ))}
        </dl>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2 px-4 pb-3.5 pt-3">
        {failed && (
          <p role="alert" className="mr-auto text-sm text-bad">
            Couldn't record your decision. Try again.
          </p>
        )}
        <Button variant="outline" disabled={isBusy} onClick={() => void respond(false)}>
          {submitting === "deny" && <CircleNotchIcon className="mr-1.5 size-3.5 animate-spin" />}
          Deny
        </Button>
        <Button disabled={isBusy} onClick={() => void respond(true)}>
          {submitting === "approve" && <CircleNotchIcon className="mr-1.5 size-3.5 animate-spin" />}
          Approve
        </Button>
      </div>
    </div>
  );
};

/** Approve or deny every waiting request on the message at once, shown when there are several. */
export const ChatApprovalBulkBar = () => {
  const aui = useAui();
  const pendingCount = useAuiState((s) =>
    s.message.isLast && !s.thread.isRunning ? getPendingApprovalParts(s.message.content).length : 0,
  );
  const [isBusy, setIsBusy] = useState(false);
  if (pendingCount < 2) return null;

  const decideAll = async (approved: boolean) => {
    setIsBusy(true);
    try {
      for (const part of getPendingApprovalParts(aui.message.getState().content)) {
        await aui.message
          .part({ toolCallId: part.toolCallId })
          .respondToToolApproval({ approved, reason: approved ? undefined : DENY_REASON });
      }
    } catch (error) {
      console.error("Failed to respond to tool approvals:", error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="my-3 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line-strong px-4 py-2.5">
      <span className="mr-auto text-sm text-ink-2">{pendingCount} actions need your approval</span>
      <div className="ml-auto flex gap-2">
        <Button variant="ghost" disabled={isBusy} onClick={() => void decideAll(false)}>
          Deny all
        </Button>
        <Button variant="outline" disabled={isBusy} onClick={() => void decideAll(true)}>
          Approve all
        </Button>
      </div>
    </div>
  );
};
