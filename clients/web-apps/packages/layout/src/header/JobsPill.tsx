import { Badge } from "@avplatform/ui/badge";
import { Link } from "react-router-dom";

interface JobsPillProps {
  to: string;
  runningCount?: number;
}

/** Header pill showing how many jobs are running, linking to the jobs page. */
const JobsPill = ({ to, runningCount = 0 }: JobsPillProps) => (
  <Link
    to={to}
    className="hidden rounded-sm focus-visible:shadow-focus focus-visible:outline-none md:inline-flex"
  >
    <Badge variant={runningCount ? "running" : "queued"}>
      {runningCount ? `${runningCount} running` : "No jobs running"}
    </Badge>
  </Link>
);

export { JobsPill };
