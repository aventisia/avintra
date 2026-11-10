import { DialogPrimitive } from "@avplatform/ui/dialog";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { CheckCircleIcon, MagnifyingGlassIcon, RocketIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";

import type { GetStartedStep } from "../constants/get-started-steps.constant";

type GetStartedHeroProps = {
  exploredCount: number;
  stepCount: number;
  nextStep: GetStartedStep | undefined;
  isCompleted: boolean;
};

const getIntro = (exploredCount: number, stepCount: number, isCompleted: boolean) => {
  if (isCompleted) return "Setup is marked complete. Revisit any step whenever you need it.";
  if (exploredCount === 0)
    return `Work through these ${stepCount} steps to get your workspace ready. Each one opens the right page.`;
  if (exploredCount < stepCount)
    return `Pick up where you left off: ${stepCount - exploredCount} of ${stepCount} steps to go.`;
  return "You've opened every step. Mark setup complete once everything is in place.";
};

/** Branded side panel of the Get Started guide: greeting, intro, and explored-steps progress. */
export const GetStartedHero = ({
  exploredCount,
  stepCount,
  nextStep,
  isCompleted,
}: GetStartedHeroProps) => {
  const userSession = useUserSessionStore((state) => state.userSession);
  const isAllExplored = !nextStep;
  const progress = stepCount ? exploredCount / stepCount : 0;

  return (
    <div className="relative isolate flex shrink-0 flex-col overflow-hidden bg-secondary p-6 text-white md:w-[19rem] md:p-8">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-500 via-primary-800 to-secondary"
      />
      <div
        aria-hidden="true"
        className="absolute -left-20 -top-24 -z-10 size-72 rounded-full bg-primary-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-50 [background-image:radial-gradient(rgb(255_255_255/0.22)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-28 -right-28 -z-10 hidden size-72 rounded-full border border-white/10 md:block"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -right-16 -z-10 hidden size-48 rounded-full border border-white/10 md:block"
      />

      <span className="grid size-11 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
        <RocketIcon className="size-5" />
      </span>

      <p className="mt-5 text-label uppercase text-white/70 md:mt-7">
        {userSession?.tenantName ? `Welcome to ${userSession.tenantName}` : "Welcome aboard"}
      </p>
      <DialogPrimitive.Title
        data-autofocus
        tabIndex={-1}
        className="mt-2 text-balance text-[22px] font-semibold leading-[1.15] tracking-[-0.03em] outline-none md:text-title"
      >
        {userSession?.firstName
          ? `Hi ${userSession.firstName}, let's get you set up`
          : "Let's get you set up"}
      </DialogPrimitive.Title>
      <DialogPrimitive.Description className="mt-3 text-body text-white/75">
        {getIntro(exploredCount, stepCount, isCompleted)}
      </DialogPrimitive.Description>

      <div className="mt-6 flex items-center gap-3.5 md:mt-auto md:pt-8">
        <div
          role="progressbar"
          aria-label="Setup steps explored"
          aria-valuemin={0}
          aria-valuemax={stepCount}
          aria-valuenow={exploredCount}
          className="relative size-14 shrink-0"
        >
          <svg viewBox="0 0 48 48" className="size-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              strokeWidth="3.5"
              className="stroke-white/15"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              strokeWidth="3.5"
              strokeLinecap={progress > 0 ? "round" : "butt"}
              className="stroke-white"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-button tabular-nums">
            {isAllExplored ? (
              <CheckCircleIcon className="size-5" />
            ) : (
              `${exploredCount}/${stepCount}`
            )}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-body font-semibold">
            {isAllExplored ? "Every step explored" : `${exploredCount} of ${stepCount} explored`}
          </p>
          <p className="text-hint text-white/65">
            {nextStep ? `Next: ${nextStep.title}` : "Nice work."}
          </p>
        </div>
      </div>

      <p className="mt-6 hidden items-center gap-2 text-hint text-white/60 md:flex">
        <MagnifyingGlassIcon className="size-3.5 shrink-0" />
        Search “Get started” to reopen this guide.
      </p>
    </div>
  );
};
