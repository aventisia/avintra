import { FALLBACK_STATUS_DISPLAY, STATUS_DISPLAY } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import { Panel } from "@xyflow/react";

import { JobExecutionLogDetailDto } from "../dtos/job-execution-log-details-dto";
import { formatRunDuration } from "../utils/format-duration.util";
import { STATUS_TONE_TEXT_CLASS } from "../utils/status-tone.util";

type Props = {
  run: JobExecutionLogDetailDto | undefined;
};

/** The selected run's status, remark and duration, in the Jobs-page vocabulary. */
export const RunHeader = ({ run }: Props) => {
  if (!run) return null;

  const { label, Icon, tone } = STATUS_DISPLAY[run.status] ?? FALLBACK_STATUS_DISPLAY;
  const toneClass = STATUS_TONE_TEXT_CLASS[tone];

  return (
    <Panel position="top-right">
      <div className="pointer-events-none flex max-w-md flex-col gap-0.5 rounded-md bg-surface px-3 py-2 shadow-pop">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4 shrink-0", toneClass)} aria-hidden="true" />
          <span className={cn("text-body-sm font-semibold", toneClass)}>{label}</span>
          <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
            {formatRunDuration(run.startTime, run.endTime)}
          </span>
        </div>
        {run.remark && (
          <p className="line-clamp-3 break-words whitespace-pre-wrap text-hint text-muted-foreground">
            {run.remark}
          </p>
        )}
      </div>
    </Panel>
  );
};
