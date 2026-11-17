import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, type Icon } from "@phosphor-icons/react";
import { type ReactNode, useId } from "react";

import type { VoiceStageMark } from "../types/voice-builder.type";

const STATUS_LABELS: Record<VoiceStageMark, string> = {
  ready: "(set)",
  todo: "(to do)",
  idle: "(optional)",
};

type VoiceStageProps = {
  Icon: Icon;
  /** Short verb for what the stage does, such as "Hears". */
  role: string;
  title: string;
  description: string;
  /** Draws the wire down to the next stage. */
  hasNext?: boolean;
  mark: VoiceStageMark;
  /** Control shown at the header's right, such as an on/off switch. */
  aside?: ReactNode;
  children: ReactNode;
};

/** One stage on a tab's rail: a node on the wire beside a card of fields. */
export const VoiceStage = ({
  Icon,
  role,
  title,
  description,
  hasNext = false,
  mark,
  aside,
  children,
}: VoiceStageProps) => {
  const titleId = useId();
  const isReady = mark === "ready";

  return (
    <li className="group/stage grid list-none grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
      <div aria-hidden="true" className="flex flex-col items-center pt-4">
        <span className="relative grid shrink-0">
          <IconTile
            Icon={Icon}
            className="transition-[color,box-shadow] duration-150 group-focus-within/stage:text-primary-text group-focus-within/stage:ring-primary group-focus-within/stage:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary-base)_18%,transparent)]"
          />
          <span
            className={cn(
              "absolute -bottom-1.5 -right-1.5 grid size-4 place-items-center rounded-full ring-2 ring-surface",
              isReady
                ? "bg-ok text-surface"
                : "border-[1.5px] border-dashed border-line-strong bg-surface",
            )}
          >
            {isReady && <CheckIcon weight="bold" className="size-2.5" />}
          </span>
        </span>
        {hasNext && (
          <span
            className={cn(
              "mt-2.5 w-px flex-1",
              isReady ? "bg-[color-mix(in_srgb,var(--ok)_55%,var(--line))]" : "bg-line-strong/40",
            )}
          />
        )}
      </div>
      <section
        aria-labelledby={titleId}
        className={cn(
          "flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-4 transition-colors duration-150 group-focus-within/stage:border-[color-mix(in_srgb,var(--primary-base)_35%,var(--line))]",
          hasNext && "mb-3",
        )}
      >
        <header className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="flex items-baseline gap-2">
              <span className="font-mono text-label uppercase text-muted-foreground">{role}</span>
              <span className="truncate text-body-sm font-semibold text-ink">{title}</span>
              <span className="sr-only">{STATUS_LABELS[mark]}</span>
            </h3>
            <p className="mt-0.5 text-hint text-muted-foreground">{description}</p>
          </div>
          {aside}
          {mark === "todo" && (
            <span
              aria-hidden="true"
              className="flex h-6 shrink-0 items-center gap-1.5 rounded-sm border border-[color-mix(in_srgb,var(--warn)_32%,transparent)] px-2 font-mono text-label uppercase text-[color-mix(in_srgb,var(--warn)_80%,var(--ink))]"
            >
              <span className="size-2 rounded-full bg-warn" />
              To do
            </span>
          )}
        </header>
        {children}
      </section>
    </li>
  );
};
