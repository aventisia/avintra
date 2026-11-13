import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { BrainIcon, CaretDownIcon } from "@phosphor-icons/react";
import { type KeyboardEvent, useId, useRef } from "react";

import { type ChatEffort } from "../utils/model-effort.util";

export type ChatEffortPickerProps = {
  /** Selected effort, or null for the model's default. */
  value: ChatEffort | null;
  onChange: (effort: ChatEffort | null) => void;
};

const STEPS: readonly { value: ChatEffort | null; label: string; description: string }[] = [
  { value: null, label: "Default", description: "The model decides how long to think." },
  { value: "low", label: "Low", description: "Quick answers with little reasoning." },
  { value: "medium", label: "Medium", description: "Balances speed and careful reasoning." },
  { value: "high", label: "High", description: "Thinks longest. Best for hard problems." },
];

const LAST = STEPS.length - 1;

const stepIndex = (effort: ChatEffort | null) =>
  Math.max(
    0,
    STEPS.findIndex((step) => step.value === effort),
  );

/** Composer chip that sets how long a reasoning model thinks, on a four-stop slider. */
export const ChatEffortPicker = ({ value, onChange }: ChatEffortPickerProps) => {
  const index = stepIndex(value);
  const current = STEPS[index]!;
  const labelId = useId();
  const stopsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (next: number) => {
    onChange(STEPS[next]!.value);
    stopsRef.current[next]?.focus();
  };

  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = {
      ArrowRight: Math.min(LAST, index + 1),
      ArrowUp: Math.min(LAST, index + 1),
      ArrowLeft: Math.max(0, index - 1),
      ArrowDown: Math.max(0, index - 1),
      Home: 0,
      End: LAST,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Effort: ${current.label}`}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-hover data-[state=open]:text-ink"
      >
        <BrainIcon
          weight={value ? "fill" : "regular"}
          className={cn("size-4 shrink-0", value && "text-primary")}
        />
        <span>{value ? `${current.label} effort` : "Effort"}</span>
        <CaretDownIcon weight="bold" className="size-3 shrink-0 opacity-70" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          stopsRef.current[index]?.focus();
        }}
        className="w-[18rem] rounded-xl bg-popover px-4 pb-3.5 pt-3 ring-1 ring-line"
      >
        <p id={labelId} className="text-[12.5px] font-semibold text-ink-2">
          Thinking effort
        </p>

        <div
          role="radiogroup"
          aria-labelledby={labelId}
          onKeyDown={move}
          className="relative mt-3 grid grid-cols-4"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[12.5%] top-[7px] h-0.5 rounded-full bg-line"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-200 ease-out motion-reduce:transition-none"
              style={{ width: `${(index / LAST) * 100}%` }}
            />
            <span
              className="absolute top-1/2 z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-popover shadow-sm ring-2 ring-primary transition-[left] duration-200 ease-out motion-reduce:transition-none"
              style={{ left: `${(index / LAST) * 100}%` }}
            />
          </span>

          {STEPS.map((step, stop) => {
            const isChecked = stop === index;
            return (
              <button
                key={step.label}
                ref={(node) => {
                  stopsRef.current[stop] = node;
                }}
                type="button"
                role="radio"
                aria-checked={isChecked}
                tabIndex={isChecked ? 0 : -1}
                onClick={() => select(stop)}
                className="group relative flex flex-col items-center gap-2 rounded-md pb-1 outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-[5px] size-1.5 rounded-full transition-colors",
                    stop <= index ? "bg-primary" : "bg-muted-foreground/40 group-hover:bg-ink-2",
                  )}
                />
                <span
                  className={cn(
                    "text-[12px] transition-colors",
                    isChecked
                      ? "font-semibold text-ink"
                      : "text-muted-foreground group-hover:text-ink-2",
                  )}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{current.description}</p>
      </PopoverContent>
    </Popover>
  );
};
