import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";

// shortcut: sample numbers for design review; wire to a run-stats API once the panel is approved.
const SAMPLE_DAILY_RUNS = [3, 5, 2, 8, 6, 9, 4, 7, 12, 9, 11, 8, 14, 10];
const SAMPLE_STATS = [
  { label: "Runs", value: "108" },
  { label: "Success", value: "96%" },
  { label: "Avg. time", value: "4.2s" },
];

/**
 * Run activity over the last 14 days.
 */
export const AgentActivity = () => {
  const peak = Math.max(...SAMPLE_DAILY_RUNS);

  return (
    <section className="mx-4 mb-4 rounded-lg border border-line bg-sunken/60 p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Last 14 days
        </span>
        <Badge variant="draft">Sample data</Badge>
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {SAMPLE_STATS.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <dt className="text-hint text-muted-foreground">{stat.label}</dt>
            <dd className="font-mono text-[17px] font-semibold leading-6 text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div aria-hidden="true" className="mt-3 flex h-9 items-end gap-[3px]">
        {SAMPLE_DAILY_RUNS.map((runs, index) => (
          <span
            key={index}
            style={{ height: `${Math.max((runs / peak) * 100, 8)}%` }}
            className={cn(
              "flex-1 rounded-[2px] transition-colors",
              index === SAMPLE_DAILY_RUNS.length - 1 ? "bg-primary" : "bg-primary/35",
            )}
          />
        ))}
      </div>
    </section>
  );
};
