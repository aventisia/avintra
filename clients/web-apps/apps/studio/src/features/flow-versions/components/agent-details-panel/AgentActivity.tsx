import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { ChartBarIcon } from "@phosphor-icons/react";
import { format, subDays } from "date-fns";
import { type KeyboardEvent, useEffect, useMemo, useState } from "react";

// shortcut: sample numbers for design review; wire to a run-stats API once the panel is approved.
const SAMPLE_DAILY_RUNS = [3, 5, 2, 8, 6, 9, 4, 7, 12, 9, 11, 8, 14, 10];
const SAMPLE_DAILY_FAILED = [0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0];
const SAMPLE_AVERAGE_SECONDS = 4.2;

const RISE_STAGGER_MS = 22;

type DayRuns = { date: Date; runs: number; failed: number };

const buildDays = (): DayRuns[] => {
  const today = new Date();
  return SAMPLE_DAILY_RUNS.map((runs, index) => ({
    date: subDays(today, SAMPLE_DAILY_RUNS.length - 1 - index),
    runs,
    failed: SAMPLE_DAILY_FAILED[index] ?? 0,
  }));
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Run activity over the last 14 days. The headline sentence describes the whole period until a
 * day is pointed at or picked with the arrow keys, then it describes that day. Failed runs sit
 * at the base of each day's bar.
 */
export const AgentActivity = () => {
  const days = useMemo(buildDays, []);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hasRisen, setHasRisen] = useState(prefersReducedMotion);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasRisen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const totalRuns = days.reduce((sum, day) => sum + day.runs, 0);
  const totalFailed = days.reduce((sum, day) => sum + day.failed, 0);
  const peak = Math.max(1, ...days.map((day) => day.runs));
  const lastIndex = days.length - 1;
  const accentIndex = activeIndex ?? lastIndex;
  const activeDay = activeIndex === null ? null : days[activeIndex];

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    setActiveIndex((index) => Math.min(lastIndex, Math.max(0, (index ?? lastIndex) + step)));
  };

  if (totalRuns === 0) {
    return (
      <section className="px-4 pb-4 pt-1">
        <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong/50 text-center">
          <ChartBarIcon className="size-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-body-sm font-medium text-ink-2">No runs in the last 14 days</p>
          <p className="text-hint text-muted-foreground">Run the agent to see its activity here.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Run activity" className="px-4 pb-4">
      <div aria-live="polite" className="min-h-[3.75rem]">
        <div className="flex items-start justify-between gap-3">
          <p className="flex min-w-0 items-baseline gap-1.5">
            <span className="text-title tabular-nums text-ink">
              {activeDay ? activeDay.runs : totalRuns}
            </span>
            <span className="truncate text-body text-muted-foreground">
              {activeDay
                ? `${activeDay.runs === 1 ? "run" : "runs"} on ${format(activeDay.date, "EEE, MMM d")}`
                : "runs in the last 14 days"}
            </span>
          </p>
          <Badge variant="draft" className="mt-1.5 shrink-0">
            Sample data
          </Badge>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-hint text-muted-foreground">
          {activeDay ? (
            <>
              <RunStat
                swatch="bg-primary/40 dark:bg-primary-300/45"
                value={`${activeDay.runs - activeDay.failed}`}
                label="succeeded"
              />
              <RunStat swatch="bg-bad" value={`${activeDay.failed}`} label="failed" />
            </>
          ) : (
            <>
              <RunStat
                swatch="bg-primary/40 dark:bg-primary-300/45"
                value={`${Math.round(((totalRuns - totalFailed) / totalRuns) * 100)}%`}
                label="succeeded"
              />
              <RunStat swatch="bg-bad" value={`${totalFailed}`} label="failed" />
              <RunStat value={`${SAMPLE_AVERAGE_SECONDS}s`} label="average run" />
            </>
          )}
        </p>
      </div>

      <div
        role="group"
        tabIndex={0}
        aria-label="Daily runs. Use the left and right arrow keys to inspect a day."
        onKeyDown={handleKeyDown}
        onFocus={() => setActiveIndex((index) => index ?? lastIndex)}
        onBlur={() => setActiveIndex(null)}
        onPointerLeave={() => setActiveIndex(null)}
        className="-mx-1.5 mt-2 rounded-md px-1.5 pb-1 pt-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28]"
      >
        <div className="flex h-14 items-end border-b border-line-strong/40">
          {days.map((day, index) => (
            <DayBar
              key={day.date.toISOString()}
              day={day}
              heightPercent={hasRisen ? (day.runs / peak) * 100 : 0}
              riseDelayMs={index * RISE_STAGGER_MS}
              isAccent={index === accentIndex}
              isDimmed={activeIndex !== null && index !== activeIndex}
              onPoint={() => setActiveIndex(index)}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] leading-4 tabular-nums text-muted-foreground">
          <span>{format(days[0].date, "MMM d")}</span>
          <span>Today</span>
        </div>
      </div>
    </section>
  );
};

const RunStat = ({ swatch, value, label }: { swatch?: string; value: string; label?: string }) => (
  <span className="inline-flex items-center gap-1.5">
    {swatch ? <span aria-hidden="true" className={cn("size-2 rounded-[2px]", swatch)} /> : null}
    <span className="font-medium tabular-nums text-ink-2">{value}</span>
    {label ? <span>{label}</span> : null}
  </span>
);

interface DayBarProps {
  day: DayRuns;
  heightPercent: number;
  riseDelayMs: number;
  isAccent: boolean;
  isDimmed: boolean;
  onPoint: () => void;
}

const DayBar = ({ day, heightPercent, riseDelayMs, isAccent, isDimmed, onPoint }: DayBarProps) => {
  const succeeded = day.runs - day.failed;

  return (
    <div onPointerEnter={onPoint} className="flex h-full flex-1 items-end justify-center px-[3px]">
      {day.runs === 0 ? (
        <span className="h-0.5 w-full max-w-[18px] rounded-full bg-line-strong/40" />
      ) : (
        <span
          style={{
            height: `${Math.max(heightPercent, heightPercent ? 8 : 0)}%`,
            transition: `height 520ms cubic-bezier(0.2, 0.8, 0.2, 1) ${riseDelayMs}ms, opacity 150ms`,
          }}
          className={cn(
            "flex w-full max-w-[18px] flex-col justify-end gap-[2px]",
            isDimmed && "opacity-45",
          )}
        >
          {succeeded > 0 ? (
            <span
              style={{ flexGrow: succeeded }}
              className={cn(
                "min-h-[2px] rounded-t-[4px] transition-colors",
                isAccent ? "bg-primary" : "bg-primary/40 dark:bg-primary-300/45",
              )}
            />
          ) : null}
          {day.failed > 0 ? (
            <span
              style={{ flexGrow: day.failed }}
              className={cn("min-h-[3px] bg-bad", succeeded === 0 && "rounded-t-[4px]")}
            />
          ) : null}
        </span>
      )}
    </div>
  );
};
