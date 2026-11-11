import { Badge } from "@avplatform/ui/badge";

const LLM_COLOR = "hsl(241, 78%, 66%)";
const EXEC_COLOR = "hsl(160, 84%, 39%)";

/**
 * Minimum share of the bar each non-zero segment is guaranteed (as a percentage),
 * so very small but non-zero splits (e.g. 0.1% execution) remain visible.
 * Segments are renormalized so the two still sum to 100%.
 */
const MIN_SEGMENT_PERCENT = 4;

/**
 * Renders a compact stacked breakdown bar + chips showing Execution vs LLM credits
 * for a given row, alongside the total.
 */
export const UsageBreakdownCell = ({
  totalCredits,
  executionCredits,
  llmCredits,
}: {
  totalCredits: number;
  executionCredits: number;
  llmCredits: number;
}) => {
  const total = totalCredits || 0;
  const exec = executionCredits || 0;
  const llm = llmCredits || 0;

  // Raw proportional shares (0-100). Non-zero segments below the minimum are
  // bumped up to the minimum so they stay visible, then renormalized to sum 100.
  let execPct = total > 0 ? (exec / total) * 100 : 0;
  let llmPct = total > 0 ? (llm / total) * 100 : 0;

  if (execPct > 0 && execPct < MIN_SEGMENT_PERCENT) execPct = MIN_SEGMENT_PERCENT;
  if (llmPct > 0 && llmPct < MIN_SEGMENT_PERCENT) llmPct = MIN_SEGMENT_PERCENT;

  const segmentSum = execPct + llmPct;
  if (segmentSum > 0) {
    execPct = (execPct / segmentSum) * 100;
    llmPct = (llmPct / segmentSum) * 100;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {llmPct > 0 && <div style={{ width: `${llmPct}%`, backgroundColor: LLM_COLOR }} />}
        {execPct > 0 && <div style={{ width: `${execPct}%`, backgroundColor: EXEC_COLOR }} />}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="gap-1 text-2xs font-normal">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: LLM_COLOR }} />
          LLM {llm.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </Badge>
        <Badge variant="outline" className="gap-1 text-2xs font-normal">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EXEC_COLOR }} />
          Exec {exec.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </Badge>
      </div>
    </div>
  );
};
