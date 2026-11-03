import { LoadingSpinner } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import {
  ArrowsSplitIcon,
  CheckIcon,
  EnvelopeIcon,
  KeyIcon,
  LightningIcon,
  LockIcon,
  type Icon as PhosphorIcon,
  PlusIcon,
  SparkleIcon,
  UserIcon,
} from "@phosphor-icons/react";

type FlowStepStatus = "done" | "running" | "waiting" | "draft";

type FlowStep = { kind: string; title: string; state: FlowStepStatus; Icon: PhosphorIcon };

type PanelCopy = { kicker: string; title: string; description: string };

type RightContainerProps =
  { variant?: "login" | "create-account" } | { variant: "reset-pwd"; stepNo: number };

type FlowBranches = { yes: FlowStep; no: FlowStep };

type Panel = PanelCopy & { steps: FlowStep[]; branches?: FlowBranches };

const panels: Record<"login" | "create-account", Panel> = {
  login: {
    kicker: "Agentic workflow automation",
    title: "Your work, run by agents.",
    description:
      "Build a flow once. It runs step by step, and stops for you when a decision needs a person.",
    steps: [
      { kind: "Trigger", title: "Invoice received", state: "done", Icon: LightningIcon },
      { kind: "AI action", title: "Check the totals", state: "done", Icon: SparkleIcon },
      { kind: "Condition", title: "Over $5,000?", state: "done", Icon: ArrowsSplitIcon },
    ],
    branches: {
      yes: { kind: "Review", title: "You approve", state: "waiting", Icon: UserIcon },
      no: { kind: "Action", title: "Pay invoice", state: "draft", Icon: LightningIcon },
    },
  },
  "create-account": {
    kicker: "Create your account",
    title: "Start with one flow.",
    description:
      "Pick a trigger, add AI actions, and keep a person in the loop wherever you need one.",
    steps: [
      { kind: "Trigger", title: "New CRM lead", state: "done", Icon: LightningIcon },
      { kind: "AI action", title: "Draft a follow-up", state: "done", Icon: SparkleIcon },
      { kind: "Condition", title: "Deal over $10k?", state: "done", Icon: ArrowsSplitIcon },
    ],
    branches: {
      yes: { kind: "Review", title: "Rep reviews", state: "draft", Icon: UserIcon },
      no: { kind: "Next step", title: "Add a step", state: "draft", Icon: PlusIcon },
    },
  },
};

const resetPwdCopy: PanelCopy = {
  kicker: "Reset password",
  title: "Back in three steps.",
  description: "We email you a code to confirm it's you, then you choose a new password.",
};

const resetPwdSteps = [
  { title: "Enter your email", Icon: EnvelopeIcon },
  { title: "Enter the code", Icon: KeyIcon },
  { title: "Set a new password", Icon: LockIcon },
];

const getResetPwdSteps = (stepNo: number): FlowStep[] =>
  resetPwdSteps.map((step, index) => ({
    ...step,
    kind: `Step ${index + 1}`,
    state: index + 1 < stepNo ? "done" : index + 1 === stepNo ? "running" : "draft",
  }));

const FlowStepState = ({ state }: { state: FlowStepStatus }) => {
  if (state === "done")
    return (
      <span className="grid size-5 place-items-center rounded-full bg-ok text-bg">
        <CheckIcon className="size-3" weight="bold" />
      </span>
    );
  if (state === "running") return <LoadingSpinner className="size-5 text-live" />;
  if (state === "draft") return null;
  return <span className="size-5 rounded-full border border-dashed border-line-strong" />;
};

const FlowStepNode = ({
  kind,
  title,
  state,
  Icon,
  className,
}: FlowStep & { className?: string }) => (
  <div
    className={cn(
      "flex h-[60px] w-[220px] items-center gap-3 rounded-md border border-line-strong bg-surface px-3",
      className,
      state === "running" && "border-live",
      state === "waiting" && "border-dashed border-warn",
      state === "draft" && "border-dashed bg-transparent",
    )}
  >
    <span className="grid size-7 shrink-0 place-items-center rounded-md border border-line bg-sunken text-ink-2">
      <Icon className="size-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-mono text-label uppercase text-muted-foreground">
        {kind}
      </span>
      <span className="block truncate text-body-sm font-semibold text-ink">{title}</span>
    </span>
    <FlowStepState state={state} />
  </div>
);

const FlowStepBranches = ({ yes, no }: FlowBranches) => (
  <div className="flex flex-col items-center">
    <span className="h-5 w-px bg-line-strong" />
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Yes", step: yes, line: "left-1/2 -right-2" },
        { label: "No", step: no, line: "-left-2 right-1/2" },
      ].map(({ label, step, line }) => (
        <div key={label} className="relative flex flex-col items-center pt-10">
          <span className={cn("absolute top-0 h-px bg-line-strong", line)} />
          <span className="absolute left-1/2 top-0 h-10 w-px bg-line-strong" />
          <span className="absolute left-1/2 top-3 ml-2 font-mono text-label uppercase text-muted-foreground">
            {label}
          </span>
          <FlowStepNode {...step} className="w-[184px]" />
        </div>
      ))}
    </div>
  </div>
);

/** Always-dark brand panel shown beside the accounts forms on wide screens. */
const RightContainer = (props: RightContainerProps) => {
  const { steps, branches, ...copy }: Panel =
    props.variant === "reset-pwd"
      ? { ...resetPwdCopy, steps: getResetPwdSteps(props.stepNo) }
      : panels[props.variant ?? "login"];

  return (
    <aside className="dark relative hidden flex-col justify-end gap-3 overflow-hidden bg-bg bg-[linear-gradient(var(--canvas-grid)_1px,transparent_1px),linear-gradient(90deg,var(--canvas-grid)_1px,transparent_1px)] bg-[size:24px_24px] p-8 text-ink min-[900px]:flex">
      <div aria-hidden="true" className="flex flex-1 flex-col items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center">
            {index > 0 && <span className="h-10 w-px bg-line-strong" />}
            <FlowStepNode {...step} />
          </div>
        ))}
        {branches && <FlowStepBranches {...branches} />}
      </div>
      <p className="font-mono text-label uppercase text-muted-foreground">{copy.kicker}</p>
      <h2 className="text-display text-ink">{copy.title}</h2>
      <p className="max-w-[380px] text-body text-ink-2">{copy.description}</p>
    </aside>
  );
};

export { RightContainer };
