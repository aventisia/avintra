import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleIcon,
  CpuIcon,
  InfoIcon,
  KeyRoundIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { HelpButton } from "@/components/help/HelpButton";
import { useOnboardingStore } from "@/stores/onboarding-store";

interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  /** Route to navigate to when the user clicks "Go to …". */
  route: string;
  /** Guide id shown via the in-app help button (see docs-content/registry.ts). */
  guideId: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: "Invite users",
    description:
      "Invite the people who will work in your tenant. Invitations can only be sent by the tenant admin — there is no self-sign-up for new members.",
    route: "/tenant/users",
    guideId: "users",
    Icon: UsersIcon,
  },
  {
    step: 2,
    title: "Define spaces",
    description:
      "Create spaces to organize users and resources the way you work — for example by team or project. Use the information button on each page to learn what a feature is for and how to set it up.",
    route: "/tenant/spaces",
    guideId: "spaces",
    Icon: ShieldCheckIcon,
  },
  {
    step: 3,
    title: "Save credentials in the vault",
    description:
      "Store the credentials for the applications you want to use. Secrets are encrypted at rest and access is audited.",
    route: "/configure/vault",
    guideId: "vault",
    Icon: KeyRoundIcon,
  },
  {
    step: 4,
    title: "Enable models",
    description:
      "Connect and enable the AI models your agents will use by setting up a model provider and its API key.",
    route: "/tenant/model-providers",
    guideId: "models",
    Icon: CpuIcon,
  },
  {
    step: 5,
    title: "Create your first agent in Build",
    description:
      "Once your users, spaces, credentials, and models are ready, build your first agent by clicking Create Agent in Build.",
    route: "/agents",
    guideId: "agents",
    Icon: PlayCircleIcon,
  },
];

/**
 * The "Get Started" onboarding page for Tenant Admins. Presents the five-step
 * setup flow (invite users → define spaces → save credentials → enable models →
 * create an agent), each linking to the relevant feature page and its help guide.
 */
const GetStartedPage = () => {
  useDocumentTitle("Get started");
  const navigate = useNavigate();

  const { isComplete, markComplete } = useOnboardingStore(
    useShallow((state) => ({ isComplete: state.isComplete, markComplete: state.markComplete })),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-title text-ink">Get started</h2>
        </div>
        {isComplete ? <Badge variant="completed">Setup complete</Badge> : null}
      </div>

      <p className="mb-8 max-w-3xl text-base text-muted-foreground">
        Complete these five steps to set up your workspace and build your first agent. Each step
        opens the relevant page — use the{" "}
        <InfoIcon className="inline size-5 align-text-bottom" aria-label="info" /> information
        button on any page to learn what a feature does and how to set it up.
      </p>

      <ol className="space-y-4">
        {ONBOARDING_STEPS.map(({ step, title, description, route, guideId, Icon }) => (
          <li
            key={step}
            className="group flex items-start gap-4 rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sunken text-ink-2">
              <Icon className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground">Step {step}</span>
                <HelpButton guideId={guideId} tooltip={`Help: ${title}`} />
              </div>
              <h3 className="mt-0.5 text-heading text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>

            <Button variant="outline" className="mt-1 shrink-0" onClick={() => navigate(route)}>
              Go to {title.split(" ")[0] || "page"}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex items-center justify-between rounded-lg border border-line bg-sunken p-5">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <CheckCircle2Icon className="h-6 w-6 text-ok" />
          ) : (
            <CircleIcon className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isComplete
              ? "You've completed the setup. You can return here any time from Tenant Admin."
              : "Finished the steps? Mark setup as complete to dismiss this guide."}
          </p>
        </div>
        <Button
          variant={isComplete ? "ghost" : "default"}
          className={cn("shrink-0")}
          onClick={markComplete}
        >
          <CheckCircle2Icon className="h-4 w-4" />
          {isComplete ? "Completed" : "Mark as complete"}
        </Button>
      </div>
    </div>
  );
};

export { GetStartedPage };
