import { cn } from "@avplatform/ui/lib";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { motion } from "motion/react";

import type { GetStartedStep } from "../constants/get-started-steps.constant";

export type GetStartedStepStatus = "explored" | "next" | "todo";

type GetStartedStepItemProps = {
  step: GetStartedStep;
  position: number;
  status: GetStartedStepStatus;
  isLast: boolean;
  onOpen: (step: GetStartedStep) => void;
};

/** One checklist row: a numbered timeline marker, the step copy, and a link to its page. */
export const GetStartedStepItem = ({
  step,
  position,
  status,
  isLast,
  onOpen,
}: GetStartedStepItemProps) => {
  const isNext = status === "next";
  const isExplored = status === "explored";

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 + position * 0.05, duration: 0.3, ease: "easeOut" }}
    >
      <button
        type="button"
        onClick={() => onOpen(step)}
        className={cn(
          "group flex w-full items-start gap-3.5 rounded-lg p-3 text-left outline-none transition-colors duration-150 focus-visible:shadow-focus motion-reduce:transition-none",
          isNext
            ? "bg-primary/[0.05] ring-1 ring-inset ring-primary/25 hover:bg-primary/[0.08]"
            : "hover:bg-hover",
        )}
      >
        <span className="flex shrink-0 flex-col items-center self-stretch">
          <span
            className={cn(
              "grid size-9 place-items-center rounded-full ring-1 ring-inset transition-colors duration-150",
              isExplored && "bg-ok/10 text-ok ring-ok/30",
              isNext && "bg-primary text-primary-foreground shadow-sm ring-primary",
              status === "todo" && "bg-surface text-ink-2 ring-line group-hover:ring-line-strong",
            )}
          >
            {isExplored ? (
              <CheckIcon className="size-4" strokeWidth={2.5} />
            ) : (
              <step.Icon className="size-4 shrink-0" />
            )}
          </span>
          {!isLast && (
            <span
              aria-hidden="true"
              className={cn("-mb-6 mt-1 w-px flex-1", isExplored ? "bg-ok/40" : "bg-line")}
            />
          )}
        </span>

        <span className="min-w-0 flex-1 pt-px">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn("text-body font-semibold", isExplored ? "text-ink-2" : "text-ink")}>
              {step.title}
            </span>
            {isNext && (
              <span className="rounded-full bg-primary/10 px-2 py-px text-2xs font-semibold text-primary-text">
                Up next
              </span>
            )}
            {isExplored && <span className="sr-only">(explored)</span>}
          </span>
          <span className="mt-0.5 block text-body-sm text-muted-foreground">
            {step.description}
          </span>
        </span>

        {isNext ? (
          <span className="mt-0.5 inline-flex h-control-md shrink-0 items-center gap-1.5 rounded-md bg-primary px-2.5 text-button text-primary-foreground shadow-sm transition-colors group-hover:bg-primary-hover sm:px-3">
            <span className="hidden sm:inline">Start</span>
            <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </span>
        ) : (
          <ArrowRightIcon className="mt-2.5 size-4 shrink-0 text-muted-foreground/60 transition duration-150 group-hover:translate-x-0.5 group-hover:text-ink group-focus-visible:text-ink motion-reduce:transform-none" />
        )}
      </button>
    </motion.li>
  );
};
