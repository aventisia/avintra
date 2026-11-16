import { cn } from "@avplatform/ui/lib";
import { Link } from "react-router-dom";

interface JobsPillProps {
  to: string;
  runningCount?: number;
}

/** Header pill showing how many jobs are running, linking to the jobs page. */
const JobsPill = ({ to, runningCount = 0 }: JobsPillProps) => (
  <Link
    to={to}
    className={cn(
      "hidden h-7 items-center gap-[7px] whitespace-nowrap rounded-sm px-2.5 text-[12.5px] font-semibold transition-colors focus-visible:shadow-focus focus-visible:outline-none md:inline-flex",
      runningCount
        ? "bg-live/10 text-primary-text hover:bg-live/15"
        : "bg-sunken text-muted-foreground hover:bg-hover hover:text-ink-2",
    )}
  >
    <span
      className={cn(
        "size-[7px] rounded-full",
        runningCount ? "animate-pulse bg-live motion-reduce:animate-none" : "bg-muted-foreground",
      )}
    />
    {runningCount
      ? `${runningCount} ${runningCount === 1 ? "job" : "jobs"} running`
      : "No jobs running"}
  </Link>
);

export { JobsPill };
