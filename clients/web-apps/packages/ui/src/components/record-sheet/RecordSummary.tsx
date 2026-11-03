import type { ComponentType, ReactNode } from "react";

import { CopyableText } from "@/ui/components/CopyableText";
import { FALLBACK_VALUE } from "@/ui/constants";
import { cn } from "@/ui/lib";
import { type IconProps } from "@/ui/types";

import { recordLabelClass } from "./record-label-class";

export type RecordTone = "ok" | "live" | "warn" | "bad" | "neutral";

const TONES: Record<RecordTone, { dot: string; text: string; wash: string }> = {
  ok: { dot: "bg-ok", text: "text-ok", wash: "from-ok/[0.07]" },
  live: { dot: "bg-live", text: "text-live", wash: "from-live/[0.07]" },
  warn: { dot: "bg-warn", text: "text-warn", wash: "from-warn/[0.07]" },
  bad: { dot: "bg-bad", text: "text-bad", wash: "from-bad/[0.07]" },
  neutral: { dot: "bg-line-strong", text: "text-ink-2", wash: "from-sunken" },
};

/**
 * Card holding a record's status hero, fact grid and identifiers, separated by hairlines.
 */
export const RecordSummary = ({ children }: { children: ReactNode }) => (
  <section className="divide-y divide-line overflow-hidden rounded-lg bg-popover ring-1 ring-line">
    {children}
  </section>
);

type RecordStatusHeroProps = {
  Icon: ComponentType<IconProps>;
  tone: RecordTone;
  title: ReactNode;
  description?: ReactNode;
  /** Mono line under the description, for example an exact timestamp. */
  detail?: ReactNode;
  /** Top-right slot, for example a state badge. */
  aside?: ReactNode;
  /** Greys out the icon, for example while the record is disabled. */
  isMuted?: boolean;
};

/**
 * Status band tinted by tone: an icon tile with a status dot (pulsing when live), the status
 * as the title, and supporting lines.
 */
export const RecordStatusHero = ({
  Icon,
  tone,
  title,
  description,
  detail,
  aside,
  isMuted = false,
}: RecordStatusHeroProps) => {
  const toneClasses = TONES[tone];

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 bg-gradient-to-r to-transparent p-4",
        toneClasses.wash,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-3/5 opacity-50 [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:linear-gradient(to_left,black,transparent)]"
      />
      <span className="relative grid size-14 shrink-0 place-items-center rounded-xl bg-popover shadow-sm ring-1 ring-line">
        <Icon className={cn("size-7", isMuted ? "text-muted-foreground" : "text-ink")} />
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-1 -right-1 size-3.5 rounded-full ring-[3px] ring-popover",
            toneClasses.dot,
          )}
        >
          {tone === "live" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-live motion-reduce:animate-none" />
          )}
        </span>
      </span>
      <div className="relative min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[17px] font-semibold leading-6 tracking-[-0.01em]",
            toneClasses.text,
          )}
        >
          {title}
        </p>
        {description && <p className="truncate text-[12.5px] text-ink-2">{description}</p>}
        {detail && (
          <p className="truncate font-mono text-[11.5px] tabular-nums text-muted-foreground">
            {detail}
          </p>
        )}
      </div>
      {aside && <div className="relative self-start">{aside}</div>}
    </div>
  );
};

/**
 * Two-column grid of facts; an odd last fact spans both columns.
 */
export const RecordFactGrid = ({ children }: { children: ReactNode }) => (
  <dl className="grid grid-cols-2 gap-px bg-line [&>*:last-child:nth-child(odd)]:col-span-2">
    {children}
  </dl>
);

type RecordFactProps = {
  Icon?: ComponentType<IconProps>;
  label: string;
  value: ReactNode;
  /** Shown before a non-empty value, for example an avatar. */
  prefix?: ReactNode;
};

export const RecordFact = ({ Icon, label, value, prefix }: RecordFactProps) => {
  const isEmpty = value === undefined || value === null || value === "";

  return (
    <div className="min-w-0 bg-popover px-4 py-3">
      <dt className={cn("flex items-center gap-1.5", recordLabelClass)}>
        {Icon && <Icon className="size-3.5" />}
        {label}
      </dt>
      <dd className="mt-1.5 flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink">
        {!isEmpty && prefix}
        <span className="truncate" title={typeof value === "string" ? value : undefined}>
          {isEmpty ? FALLBACK_VALUE : value}
        </span>
      </dd>
    </div>
  );
};

/**
 * Sunken strip of copyable identifiers at the foot of a record summary.
 */
export const RecordIdentifiers = ({ children }: { children: ReactNode }) => (
  <dl className="space-y-1.5 bg-sunken/60 px-4 py-3">{children}</dl>
);

export const RecordIdentifier = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex min-w-0 items-center gap-3">
    <dt className={cn("w-24 shrink-0", recordLabelClass)}>{label}</dt>
    <dd className="min-w-0 font-mono text-[12px] text-ink-2">
      {value ? <CopyableText value={value} /> : FALLBACK_VALUE}
    </dd>
  </div>
);
