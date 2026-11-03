import { DialogPrimitive } from "@avplatform/ui/dialog";
import { toast } from "@avplatform/ui/sonner";
import { ONBOARDING_REMINDER_DAYS, isRouteWithin } from "@avplatform/ui/utils";
import { CheckCircleIcon, XIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { CardDialogFrame } from "@/components/card-dialog/CardDialogFrame";
import { useAllowedRoutesStore } from "@/stores/allowed-routes-auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

import { GET_STARTED_STEPS, type GetStartedStep } from "../constants/get-started-steps.constant";
import { useGetStartedAutoOpen } from "../hooks/useGetStartedAutoOpen.hook";
import { GetStartedHero } from "./GetStartedHero";
import { GetStartedStepItem, type GetStartedStepStatus } from "./GetStartedStepItem";

const REOPEN_HINT = "Reopen it any time from search.";

/** Get Started checklist for tenant admins, opened on sign-in until they complete or dismiss it. */
export const GetStartedDialog = () => {
  useGetStartedAutoOpen();
  const navigate = useNavigate();
  const allowedRoutes = useAllowedRoutesStore((state) => state.allowedRoutes);
  const {
    isGuideOpen,
    disposition,
    visitedSteps,
    closeGuide,
    markComplete,
    dismissForever,
    snooze,
    recordStepVisit,
  } = useOnboardingStore(
    useShallow((state) => ({
      isGuideOpen: state.isGuideOpen,
      disposition: state.disposition,
      visitedSteps: state.visitedSteps,
      closeGuide: state.closeGuide,
      markComplete: state.markComplete,
      dismissForever: state.dismissForever,
      snooze: state.snooze,
      recordStepVisit: state.recordStepVisit,
    })),
  );

  const steps = GET_STARTED_STEPS.filter((step) =>
    allowedRoutes.some((allowedRoute) => isRouteWithin(step.route, allowedRoute)),
  );
  const isStepExplored = (step: GetStartedStep) => visitedSteps.includes(step.step);
  const exploredCount = steps.filter(isStepExplored).length;
  const nextStep = steps.find((step) => !isStepExplored(step));
  const isAllExplored = !nextStep;
  const isCompleted = disposition === "completed";

  const getStatus = (step: GetStartedStep): GetStartedStepStatus => {
    if (isStepExplored(step)) return "explored";
    return step === nextStep ? "next" : "todo";
  };

  const handleOpenStep = (step: GetStartedStep) => {
    recordStepVisit(step.step);
    closeGuide();
    navigate(step.route);
  };

  const handleMarkComplete = () => {
    markComplete();
    closeGuide();
    toast.success("Setup marked complete", { description: REOPEN_HINT });
  };

  const handleDismissForever = () => {
    dismissForever();
    closeGuide();
    toast("We won't show this guide again", { description: REOPEN_HINT });
  };

  const handleSnooze = () => {
    snooze();
    closeGuide();
    toast(`We'll remind you in ${ONBOARDING_REMINDER_DAYS} days`, { description: REOPEN_HINT });
  };

  return (
    <CardDialogFrame
      isOpen={isGuideOpen && steps.length > 0}
      onClose={closeGuide}
      className="items-center p-4"
      panelClassName="max-h-[calc(100dvh-2rem)] w-[min(57rem,calc(100vw-2rem))] rounded-xl bg-surface shadow-pop md:flex-row"
    >
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-md text-white/80 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:shadow-focus md:text-muted-foreground md:hover:bg-hover md:hover:text-ink"
      >
        <XIcon className="size-4" />
      </DialogPrimitive.Close>

      <GetStartedHero
        exploredCount={exploredCount}
        stepCount={steps.length}
        nextStep={nextStep}
        isCompleted={isCompleted}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <p className="shrink-0 px-6 pb-2 pt-5 font-mono text-label uppercase text-muted-foreground md:pt-7">
          Setup checklist
        </p>
        <ol className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4 md:px-4">
          {steps.map((step, index) => (
            <GetStartedStepItem
              key={step.step}
              step={step}
              position={index}
              status={getStatus(step)}
              isLast={index === steps.length - 1}
              onOpen={handleOpenStep}
            />
          ))}
        </ol>

        <footer className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-sunken/70 px-5 py-3">
          {isCompleted ? (
            <>
              <span className="flex items-center gap-2 text-hint text-muted-foreground">
                <CheckCircleIcon className="size-4 text-ok" />
                Setup complete
              </span>
              <CardDialogButton variant="primary" className="ml-auto" onClick={closeGuide}>
                Done
              </CardDialogButton>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDismissForever}
                className="rounded-sm text-hint text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-ink hover:underline focus-visible:shadow-focus"
              >
                Don't show again
              </button>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                <CardDialogButton onClick={handleSnooze}>Remind me later</CardDialogButton>
                <CardDialogButton
                  variant={isAllExplored ? "primary" : "secondary"}
                  className={isAllExplored ? undefined : "ring-1 ring-inset ring-line"}
                  onClick={handleMarkComplete}
                >
                  <CheckCircleIcon className="size-4" />
                  Mark as complete
                </CardDialogButton>
              </div>
            </>
          )}
        </footer>
      </div>
    </CardDialogFrame>
  );
};
