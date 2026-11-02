import { CopyableText, EmptyState, LoadingSpinner, Separator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FlowVersionNavLink } from "@avplatform/ui/components/FlowVersionNavLink";
import {
  ViewBadge,
  ViewContainer,
  ViewDefaultCard,
  ViewField,
  ViewFieldWithCopy,
  ViewInfoRow,
  ViewInfoRowsCard,
} from "@avplatform/ui/components/view-record";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import { formatDate } from "@avplatform/ui/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIcon,
  BriefcaseIcon,
  CircleGaugeIcon,
  ExternalLinkIcon,
  FileJsonIcon,
  LogsIcon,
  MessageSquareTextIcon,
  ZapIcon,
} from "lucide-react";

import { getJob } from "../../apis/jobs-table-apis";
import { statusVariant } from "../../constants/column-display-names";
import type { JobRecordDto } from "../../dtos/job-record-dto";
import { JobStatusEnum } from "../../enums/job-status-enum";
import { formatSecondsToCompactDuration } from "../../utils/format-time-utils";

/**
 * JobView component displays the complete details of a job in a read-only view.
 * It fetches the job record from the backend using the rowId and renders every
 * meaningful field returned in JobRecordDto, except internal-only flowVersionHistoryId.
 * The flow version is referred to as "Agent" in user-facing labels while the
 * code continues to use flowVersion terminology.
 *
 * @returns {JSX.Element} The rendered JobView component.
 */
interface JobViewProps {
  rowId: string;
}

/** Maps the backend flow type to a user-friendly agent type label. */
const mapAgentType = (flowType: FlowTypesEnum): string => {
  switch (flowType) {
    case FlowTypesEnum.Agent:
      return "Automation";
    case FlowTypesEnum.ChatAgent:
      return "Chat";
    case FlowTypesEnum.VoiceAgent:
      return "Voice";
    default:
      return flowType;
  }
};

export const JobView = ({ rowId }: JobViewProps) => {
  // Fetch the job record from the backend
  const { data: response, isLoading } = useQuery({
    queryKey: ["job", rowId],
    queryFn: () => getJob(rowId),
    enabled: !!rowId,
  });

  const job = response?.data as JobRecordDto | undefined;

  // Show loading state while the job record is being fetched
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col text-sm gap-3 items-center justify-center">
        <LoadingSpinner className="size-8 text-primary" />
        Loading job details...
      </div>
    );
  }

  // If the job record is not found, display a message indicating that the record is not available
  if (!job) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <EmptyState
          className="-mt-20"
          Icon={BriefcaseIcon}
          primaryMessage="Job record is not available."
          secondaryMessage="Try refreshing the page and opening this record again."
        />
      </div>
    );
  }

  const executionLogUrl = `${import.meta.env.VITE_STUDIO_PATH}execution-log?v=${job.flowVersionId}&j=${job.id}`;

  // Helper to safely serialize optional JSON payloads for the JsonViewer
  const jsonToString = (value: Record<string, unknown> | undefined): string =>
    value ? JSON.stringify(value, null, 2) : "{}";

  return (
    <ViewContainer>
      <ViewDefaultCard>
        {/* Job profile section */}
        <div className="flex flex-col gap-1">
          <p className="text-2xs uppercase tracking-wide text-muted-foreground">Job profile</p>
          <CopyableText
            textClassName="truncate max-w-[24rem] text-base font-medium leading-tight"
            value={`${job.flowName}_${job.flowVersionNumber}_${job.id}`}
          />
          <CopyableText
            className="mt-0.5 w-full"
            textClassName="font-mono max-w-[24rem] text-sm font-medium text-muted-foreground"
            value={job.id ?? FALLBACK_VALUE}
          />
        </div>

        {/* Status, priority, trigger type, published and execution location badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ViewBadge
            title={`Trigger: ${job.triggerType}`}
            Icon={ZapIcon}
            text={`Trigger: ${job.triggerType}`}
          />
          <ViewBadge
            title={`Priority: ${job.priority}`}
            Icon={CircleGaugeIcon}
            text={`Priority: ${job.priority}`}
          />
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2">
          <ViewField
            label="Agent"
            value={
              <FlowVersionNavLink
                to={executionLogUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${job.flowName} ${job.flowVersionNumber} in Agent Builder`}
                flowName={job.flowName ?? "NAME_NOT_FOUND"}
                flowVersionNumber={`${job.flowVersionNumber}`}
              />
            }
          />
          <ViewField label="Type" value={mapAgentType(job.flowType)} />
          <ViewFieldWithCopy textClassName="font-mono" label="Agent ID" value={job.flowVersionId} />
          <ViewField label="Is published" value={job.isFlowVersionPublished ? "Yes" : "No"} />
          <ViewField label="Retry count" value={`#${String(job.retryCount)}`} />
          <ViewField label="Created by" value={job.createdByName} />
          <ViewField label="Created at" value={formatDate(job.createdAt, true)} />
        </div>
      </ViewDefaultCard>

      {/* Execution section - primary accent only here */}
      <ViewInfoRowsCard
        title="Execution"
        className="border-line"
        icon={<ActivityIcon className="size-3.5 text-primary" />}
      >
        <ViewInfoRow
          label="Status"
          value={
            <Badge variant={statusVariant[job.status as JobStatusEnum]}>
              <span className="truncate">{job.status}</span>
            </Badge>
          }
        />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow label="Started at" value={formatDate(job.startTimeStamp, true)} />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow label="Ended at" value={formatDate(job.endTimeStamp, true)} />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow
          label="Duration"
          value={job.duration > 0 ? formatSecondsToCompactDuration(job.duration) : FALLBACK_VALUE}
        />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow
          label="Credits consumed"
          value={
            typeof job.creditsConsumed === "number"
              ? job.creditsConsumed.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : FALLBACK_VALUE
          }
        />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow
          label="Execution location"
          valueClassName="text-right"
          value={
            <span
              className="inline-block max-w-60 truncate text-right"
              title={job.executionLocation ?? undefined}
            >
              {job.executionLocation ?? FALLBACK_VALUE}
            </span>
          }
        />
      </ViewInfoRowsCard>

      {/* Remarks section - hidden if empty */}
      {job.remarks && (
        <ViewInfoRowsCard
          title="Remarks"
          icon={<MessageSquareTextIcon className="size-3.5 text-muted-foreground" />}
        >
          <div className="px-0.5 py-1.5">
            <p className="text-xs whitespace-pre-wrap text-foreground">{job.remarks}</p>
          </div>
        </ViewInfoRowsCard>
      )}

      {/* Job input data section - hidden if empty */}
      {job.jobInputData && (
        <ViewInfoRowsCard
          title="Input data"
          icon={<FileJsonIcon className="size-3.5 text-muted-foreground" />}
          action={createCopyJsonAction(jsonToString(job.jobInputData))}
        >
          <JsonViewer
            jsonData={jsonToString(job.jobInputData)}
            enableValueClipboard
            viewportClassName=""
            shortenTextAfterLength={70}
          />
        </ViewInfoRowsCard>
      )}

      {/* Job output data section - hidden if empty */}
      {job.jobOutputData && (
        <ViewInfoRowsCard
          title="Output data"
          icon={<FileJsonIcon className="size-3.5 text-muted-foreground" />}
          action={createCopyJsonAction(jsonToString(job.jobOutputData))}
        >
          <JsonViewer
            jsonData={jsonToString(job.jobOutputData)}
            enableValueClipboard
            viewportClassName=""
            shortenTextAfterLength={70}
          />
        </ViewInfoRowsCard>
      )}

      {/* Last node log section - hidden if empty */}
      {job.lastNodeLog && (
        <ViewInfoRowsCard
          title="Last node log"
          icon={<LogsIcon className="size-3.5 text-muted-foreground" />}
          action={
            <a
              href={executionLogUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View full execution log"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <ExternalLinkIcon className="size-3.5 -mt-[0.135rem]" />
              Full log
            </a>
          }
        >
          <JsonViewer
            jsonData={jsonToString(job.lastNodeLog)}
            enableValueClipboard
            viewportClassName=""
            shortenTextAfterLength={70}
          />
        </ViewInfoRowsCard>
      )}
    </ViewContainer>
  );
};
