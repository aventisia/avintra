import { Badge } from "@avplatform/ui/badge";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import {
  RecordEmpty,
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
} from "@avplatform/ui/record-sheet";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";
import {
  ArrowBendDownRightIcon,
  ArrowsClockwiseIcon,
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  FingerprintIcon,
  KeyIcon,
  ListIcon,
  LockIcon,
  QueueIcon,
  RobotIcon,
  UserCircleIcon,
  UserGearIcon,
  UsersIcon,
} from "@phosphor-icons/react";

import { PersonAvatar } from "@/components/PersonAvatar";

import { PROCESSING_MODE_LABELS } from "../../constants/processing-mode-labels.constant";
import { QueueTypesEnum } from "../../enums/queue-instance-type-enum";
import { useFetchAllQueues } from "../../hooks/useFetchQueues";

type QueueViewProps = {
  rowId: string;
};

/**
 * Read-only queue record: state and work item counts, queue settings and audit, identifier,
 * work item schema, disposition statuses and assigned agents.
 */
export const QueueView = ({ rowId }: QueueViewProps) => {
  const { data, isLoading } = useFetchAllQueues();
  const queue = data?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(queue?.name);

  if (isLoading) return <RecordSheetLoading label="Loading queue details..." />;
  if (!queue) return <RecordSheetUnavailable Icon={ListIcon} recordLabel="Queue" />;

  const schemaFields = queue.inputSchema ?? [];
  const statuses = queue.statuses ?? [];
  const agents = queue.agentsNames ?? [];

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={ListIcon}
          tone={queue.isDisabled ? "neutral" : "ok"}
          title={queue.isDisabled ? "Disabled" : "Enabled"}
          description={`${queue.total ?? 0} work ${queue.total === 1 ? "item" : "items"}, ${queue.pending ?? 0} pending`}
          detail={queue.lastModifiedOn && `Updated ${formatRelativeTime(queue.lastModifiedOn)}`}
          isMuted={!!queue.isDisabled}
        />
        <RecordFactGrid>
          <RecordFact
            Icon={queue.type === QueueTypesEnum.User ? UsersIcon : RobotIcon}
            label="Instance type"
            value={queue.type}
          />
          <RecordFact
            Icon={QueueIcon}
            label="Processing mode"
            value={queue.processingMode && PROCESSING_MODE_LABELS[queue.processingMode]}
          />
          <RecordFact
            Icon={ArrowsClockwiseIcon}
            label="Max retries"
            value={queue.maximumRetryAttempts}
          />
          <RecordFact Icon={KeyIcon} label="Credential" value={queue.credentialName} />
          <RecordFact
            Icon={FingerprintIcon}
            label="Unique references"
            value={queue.isUniqueReferencesEnforced ? "Enforced" : "Not enforced"}
          />
          <RecordFact
            Icon={LockIcon}
            label="Encrypted storage"
            value={queue.isStoredEncrypted ? "On" : "Off"}
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={queue.createdBy}
            prefix={queue.createdBy && <PersonAvatar name={queue.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={queue.createdOn && formatDate(queue.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={queue.lastModifiedBy}
            prefix={queue.lastModifiedBy && <PersonAvatar name={queue.lastModifiedBy} size="sm" />}
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={queue.lastModifiedOn && formatDate(queue.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Queue ID" value={queue.id} />
        </RecordIdentifiers>
      </RecordSummary>

      {queue.description && (
        <RecordSection title="Description">
          <RecordPanel>
            <p className="whitespace-pre-wrap text-[13px] leading-5 text-ink">
              {queue.description}
            </p>
          </RecordPanel>
        </RecordSection>
      )}

      <RecordSection title="Work item schema" count={schemaFields.length}>
        {schemaFields.length > 0 ? (
          <RecordList>
            {schemaFields.map((field) => (
              <RecordListItem key={field.name} className="gap-4 px-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {field.label || field.name}
                    <span className="ml-2 font-mono text-[12px] font-normal text-muted-foreground">
                      {field.name}
                    </span>
                  </p>
                  {field.description && (
                    <p className="truncate text-[12px] text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {field.isUsedForUniqueIdentifier && <Badge variant="outline">Unique</Badge>}
                  {field.isRequired && <Badge variant="outline">Required</Badge>}
                  <Badge variant="secondary" className="font-mono">
                    {field.type}
                  </Badge>
                </div>
              </RecordListItem>
            ))}
          </RecordList>
        ) : (
          <RecordEmpty>No work item fields defined</RecordEmpty>
        )}
      </RecordSection>

      <RecordSection title="Disposition statuses" count={statuses.length}>
        {statuses.length > 0 ? (
          <RecordList>
            {statuses.map((status) => (
              <RecordListItem key={status.name} className="gap-4 px-4">
                <span
                  className="size-2.5 shrink-0 rounded-full bg-line-strong"
                  style={status.color ? { backgroundColor: status.color } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {status.label || status.name}
                    <span className="ml-2 font-mono text-[12px] font-normal text-muted-foreground">
                      {status.name}
                    </span>
                  </p>
                </div>
                {status.routeQueue && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground">
                    <ArrowBendDownRightIcon className="size-3.5" />
                    {status.routeQueue}
                  </span>
                )}
              </RecordListItem>
            ))}
          </RecordList>
        ) : (
          <RecordEmpty>Only the core statuses are used</RecordEmpty>
        )}
      </RecordSection>

      <RecordSection title="Agents" count={agents.length}>
        {agents.length > 0 ? (
          <RecordList>
            {agents.map((agentName) => (
              <RecordListItem key={agentName} className="text-[13px] text-ink">
                <RobotIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{agentName}</span>
              </RecordListItem>
            ))}
          </RecordList>
        ) : (
          <RecordEmpty>No agents assigned to this queue</RecordEmpty>
        )}
      </RecordSection>
    </RecordSheet>
  );
};
