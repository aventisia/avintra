import { Skeleton } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { ChartBarIcon } from "@phosphor-icons/react";
import { format, parseISO } from "date-fns";
import { type KeyboardEvent, useEffect, useMemo, useState } from "react";

import {
  AgentRunActivityDayDto,
  AgentRunActivityDto,
} from "@/features/execution-logs/dtos/agent-run-activity.dto";
import { useFetchAgentRunActivity } from "@/features/execution-logs/hooks/useFetchAgentRunActivity.hook";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

const RISE_STAGGER_MS = 22;

type DayRuns = AgentRunActivityDayDto & { day: Date };

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Run activity over the agent's last 14 local days, across all of its versions. Loads the
 * numbers from the run-activity API; shows a skeleton while loading and an empty state with no runs.
 */
export const AgentActivity = () => {
  const flowId = useCurrentFlowStore((state) => state.currentFlow.id);
  const { activity, isLoading, isError } = useFetchAgentRunActivity(flowId);

  if (isLoading) {
    return (
      <section className="px-4 pb-4 pt-0" aria-busy="true">
        <Skeleton className="h-36 rounded-lg" />
      </section>
    );
  }

  if (isError || !activity || activity.totalRuns === 0) {
    return (
      <section className="px-4 pb-4 pt-0">
        <div className="flex h-36 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong/50 text-center">
          <ChartBarIcon className="size-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-body-sm font-medium text-ink-2">
            {isError ? "Run activity unavailable" : "No runs in the last 14 days"}
          </p>
          <p className="text-hint text-muted-foreground">
            {isError ? "Try again in a moment." : "Run the agent to see its activity here."}
          </p>
        </div>
      </section>
    );
  }

  return <RunActivityChart activity={activity} />;
};

interface RunActivityChartProps {
  activity: AgentRunActivityDto;
}

const RunActivityChart = ({ activity }: RunActivityChartProps) => {
  const days = useMemo<DayRuns[]>(
    () => activity.days.map((day) => ({ ...day, day: parseISO(day.date) })),
    [activity.days],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hasRisen, setHasRisen] = useState(prefersReducedMotion);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasRisen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const peak = Math.max(1, ...days.map((day) => day.runs));
  const lastIndex = days.length - 1;
  const accentIndex = activeIndex ?? lastIndex;
  const activeDay = activeIndex === null ? null : days[activeIndex];
  const finishedRuns = activity.succeededRuns + activity.failedRuns;
  const successRate =
    finishedRuns > 0 ? Math.round((activity.succeededRuns / finishedRuns) * 100) : null;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    setActiveIndex((index) => Math.min(lastIndex, Math.max(0, (index ?? lastIndex) + step)));
  };

  return (
    <section aria-label="Run activity" className="px-4 pb-4 pt-1">
      <div aria-live="polite" className="min-h-[3.75rem]">
        <p className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-title tabular-nums text-ink">
            {activeDay ? activeDay.runs : activity.totalRuns}
          </span>
          <span className="truncate text-body text-muted-foreground">
            {activeDay
              ? `${activeDay.runs === 1 ? "run" : "runs"} on ${format(activeDay.day, "EEE, MMM d")}`
              : "runs in the last 14 days"}
          </span>
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-hint text-muted-foreground">
          {activeDay ? (
            <>
              <RunStat
                swatch="bg-primary/40 dark:bg-primary-300/45"
                value={`${activeDay.succeeded}`}
                label="succeeded"
              />
              <RunStat swatch="bg-bad" value={`${activeDay.failed}`} label="failed" />
            </>
          ) : (
            <>
              <RunStat
                swatch="bg-primary/40 dark:bg-primary-300/45"
                value={successRate === null ? "—" : `${successRate}%`}
                label="succeeded"
              />
              <RunStat swatch="bg-bad" value={`${activity.failedRuns}`} label="failed" />
              {activity.averageDurationSeconds !== null ? (
                <RunStat
                  value={`${activity.averageDurationSeconds.toFixed(1)}s`}
                  label="average run"
                />
              ) : null}
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
              key={day.date}
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
          <span>{format(days[0].day, "MMM d")}</span>
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

const DayBar = ({ day, heightPercent, riseDelayMs, isAccent, isDimmed, onPoint }: DayBarProps) => (
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
        {day.succeeded > 0 ? (
          <span
            style={{ flexGrow: day.succeeded }}
            className={cn(
              "min-h-[2px] rounded-t-[4px] transition-colors",
              isAccent ? "bg-primary" : "bg-primary/40 dark:bg-primary-300/45",
            )}
          />
        ) : null}
        {day.failed > 0 ? (
          <span
            style={{ flexGrow: day.failed }}
            className={cn("min-h-[3px] bg-bad", day.succeeded === 0 && "rounded-t-[4px]")}
          />
        ) : null}
      </span>
    )}
  </div>
);
