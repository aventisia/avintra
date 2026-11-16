import { PersonAvatar } from "@avplatform/ui/avatar";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import { cn } from "@avplatform/ui/lib";
import {
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
  RecordList,
  RecordListItem,
  RecordPanel,
  RecordSection,
  RecordSheet,
  RecordSheetLoading,
  RecordSheetUnavailable,
  RecordStatusHero,
  RecordSummary,
  type RecordTone,
} from "@avplatform/ui/record-sheet";
import type { IconProps } from "@avplatform/ui/types";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";
import {
  ArrowClockwiseIcon,
  ArrowSquareOutIcon,
  ArrowsClockwiseIcon,
  BriefcaseIcon,
  BroomIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  CoinsIcon,
  GaugeIcon,
  HourglassIcon,
  LightningIcon,
  MapPinIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  ProhibitIcon,
  StopCircleIcon,
  TimerIcon,
  UserCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import type { ComponentType, ReactNode } from "react";

import {
  AGENT_NAME_LINK_CLASS,
  AgentPublishedMark,
  AgentTypeAvatar,
  AgentVersion,
} from "@/components/AgentIdentity";
import { getFlowTypeLabel } from "@/features/01-build/flows-table/utils/flow-type-label.util";

import { getJob } from "../../apis/jobs-table-apis";
import type { JobRecordDto } from "../../dtos/job-record-dto";
import { JobStatusEnum } from "../../enums/job-status-enum";
import { formatSecondsToCompactDuration } from "../../utils/format-time-utils";

const STATUS_DISPLAY: Record<JobStatusEnum, { tone: RecordTone; Icon: ComponentType<IconProps> }> =
  {
    [JobStatusEnum.Created]: { tone: "neutral", Icon: HourglassIcon },
    [JobStatusEnum.Running]: { tone: "live", Icon: PlayCircleIcon },
    [JobStatusEnum.Resumed]: { tone: "live", Icon: PlayCircleIcon },
    [JobStatusEnum.Retrying]: { tone: "live", Icon: ArrowClockwiseIcon },
    [JobStatusEnum.Cleanup]: { tone: "live", Icon: BroomIcon },
    [JobStatusEnum.Paused]: { tone: "warn", Icon: PauseCircleIcon },
    [JobStatusEnum.Completed]: { tone: "ok", Icon: CheckCircleIcon },
    [JobStatusEnum.Failed]: { tone: "bad", Icon: XCircleIcon },
    [JobStatusEnum.Aborted]: { tone: "bad", Icon: StopCircleIcon },
    [JobStatusEnum.Killed]: { tone: "bad", Icon: StopCircleIcon },
    [JobStatusEnum.Canceled]: { tone: "neutral", Icon: ProhibitIcon },
  };

const getTimeline = (job: JobRecordDto) => {
  if (job.endTimeStamp) {
    return {
      description: `Ended ${formatRelativeTime(job.endTimeStamp)}`,
      detail: job.startTimeStamp
        ? `${formatDate(job.startTimeStamp, true)} → ${formatDate(job.endTimeStamp, true)}`
        : formatDate(job.endTimeStamp, true),
    };
  }
  if (job.startTimeStamp) {
    return {
      description: `Started ${formatRelativeTime(job.startTimeStamp)}`,
      detail: formatDate(job.startTimeStamp, true),
    };
  }
  return {
    description: `Created ${formatRelativeTime(job.createdAt)}`,
    detail: formatDate(job.createdAt, true),
  };
};

const toJsonString = (value: Record<string, unknown> | undefined) =>
  value ? JSON.stringify(value, null, 2) : "{}";

type JobPayloadSectionProps = {
  title: string;
  payload: Record<string, unknown>;
  action?: ReactNode;
};

const JobPayloadSection = ({ title, payload, action }: JobPayloadSectionProps) => {
  const json = toJsonString(payload);

  return (
    <RecordSection title={title} action={action ?? createCopyJsonAction(json)}>
      <RecordPanel className="px-3 pb-1">
        <JsonViewer
          jsonData={json}
          enableValueClipboard
          viewportClassName=""
          shortenTextAfterLength={70}
        />
      </RecordPanel>
    </RecordSection>
  );
};

type JobViewProps = {
  rowId: string;
};

/**
 * Read-only job record: run status and timeline, run facts, identifiers, the agent that ran,
 * remarks and the input, output and last node payloads.
 */
export const JobView = ({ rowId }: JobViewProps) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["job", rowId],
    queryFn: () => getJob(rowId),
    enabled: !!rowId,
  });

  const job = response?.data as JobRecordDto | undefined;
  useCrudDialogRecordView(job && `${job.flowName}_${job.flowVersionNumber}_${job.id}`);

  if (isLoading) return <RecordSheetLoading label="Loading job details..." />;
  if (!job) return <RecordSheetUnavailable Icon={BriefcaseIcon} recordLabel="Job" />;

  const executionLogUrl = `${import.meta.env.VITE_STUDIO_PATH}execution-log?v=${job.flowVersionId}&j=${job.id}`;
  const status = STATUS_DISPLAY[job.status] ?? { tone: "neutral", Icon: BriefcaseIcon };
  const { description, detail } = getTimeline(job);

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={status.Icon}
          tone={status.tone}
          title={job.status}
          description={description}
          detail={detail}
        />
        <RecordFactGrid>
          <RecordFact Icon={LightningIcon} label="Trigger" value={job.triggerType} />
          <RecordFact Icon={GaugeIcon} label="Priority" value={job.priority} />
          <RecordFact
            Icon={TimerIcon}
            label="Duration"
            value={job.duration > 0 ? formatSecondsToCompactDuration(job.duration) : undefined}
          />
          <RecordFact
            Icon={CoinsIcon}
            label="Credits consumed"
            value={job.creditsConsumed?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          />
          <RecordFact Icon={MapPinIcon} label="Execution location" value={job.executionLocation} />
          <RecordFact Icon={ArrowsClockwiseIcon} label="Retries" value={String(job.retryCount)} />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={job.createdByName}
            prefix={<PersonAvatar name={job.createdByName} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created at"
            value={formatDate(job.createdAt, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Job ID" value={job.id} />
          <RecordIdentifier label="Agent ID" value={job.flowVersionId} />
        </RecordIdentifiers>
      </RecordSummary>

      <RecordSection title="Agent">
        <RecordList>
          <RecordListItem className="text-body-sm transition-colors duration-[120ms] ease-out hover:bg-hover">
            <AgentTypeAvatar type={job.flowType} />
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <a
                href={executionLogUrl}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                title={`Open ${job.flowName} ${job.flowVersionNumber} in Agent Builder`}
                className={cn(AGENT_NAME_LINK_CLASS, "text-ink")}
              >
                {job.flowName ?? "NAME_NOT_FOUND"}
              </a>
              <AgentVersion versionNumber={job.flowVersionNumber.replace(/^v/, "")} />
              {job.isFlowVersionPublished && <AgentPublishedMark />}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {getFlowTypeLabel(job.flowType)}
            </span>
          </RecordListItem>
        </RecordList>
      </RecordSection>

      {job.remarks && (
        <RecordSection title="Remarks">
          <RecordPanel className={cn(status.tone === "bad" && "bg-bad/[0.04] ring-bad/25")}>
            <p className="whitespace-pre-wrap text-[13px] leading-5 text-ink">{job.remarks}</p>
          </RecordPanel>
        </RecordSection>
      )}

      {job.jobInputData && <JobPayloadSection title="Input data" payload={job.jobInputData} />}

      {job.jobOutputData && <JobPayloadSection title="Output data" payload={job.jobOutputData} />}

      {job.lastNodeLog && (
        <JobPayloadSection
          title="Last node log"
          payload={job.lastNodeLog}
          action={
            <a
              href={executionLogUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View full execution log"
              className="inline-flex items-center gap-1 rounded-sm text-[12px] text-muted-foreground outline-none transition-colors hover:text-primary-text focus-visible:ring-2 focus-visible:ring-focus"
            >
              <ArrowSquareOutIcon className="size-3.5" />
              Full log
            </a>
          }
        />
      )}
    </RecordSheet>
  );
};
