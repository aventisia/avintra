import { Badge } from "@avplatform/ui/badge";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import {
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
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
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  FolderSimpleUserIcon,
  MonitorIcon,
  RobotIcon,
  TimerIcon,
  UserCircleIcon,
  UserGearIcon,
  UsersIcon,
} from "@phosphor-icons/react";

import { PersonAvatar } from "@/components/PersonAvatar";
import { formatSecondsToCompactDuration } from "@/features/03-orchestrator/jobs-table/utils/format-time-utils";

import { useFetchSpaces } from "../../hooks/useFetchSpaces";

type SpaceViewProps = {
  rowId: string;
};

/**
 * Read-only space record: state, usage totals, audit, identifier and description.
 */
export const SpaceView = ({ rowId }: SpaceViewProps) => {
  const { data: response, isLoading } = useFetchSpaces();

  const space = response?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(space?.name);

  if (isLoading) return <RecordSheetLoading label="Loading space details..." />;
  if (!space) return <RecordSheetUnavailable Icon={FolderSimpleUserIcon} recordLabel="Space" />;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={FolderSimpleUserIcon}
          tone={space.isDisabled ? "bad" : "ok"}
          title={space.isDisabled ? "Disabled" : "Enabled"}
          description={
            space.lastModifiedOn && `Last modified ${formatRelativeTime(space.lastModifiedOn)}`
          }
          isMuted={space.isDisabled}
          aside={space.isDefault && <Badge variant="outline">Default space</Badge>}
        />
        <RecordFactGrid>
          <RecordFact Icon={UsersIcon} label="Users" value={space.totalUsers ?? 0} />
          <RecordFact
            Icon={RobotIcon}
            label="Published agents"
            value={space.totalPublishedAgents ?? 0}
          />
          <RecordFact
            Icon={MonitorIcon}
            label="Machines attached"
            value={space.totalMachinesAttached ?? 0}
          />
          <RecordFact
            Icon={TimerIcon}
            label="Execution time"
            value={formatSecondsToCompactDuration(space.totalExecutionTime)}
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={space.createdBy}
            prefix={space.createdBy && <PersonAvatar name={space.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={space.createdOn && formatDate(space.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={space.lastModifiedBy}
            prefix={space.lastModifiedBy && <PersonAvatar name={space.lastModifiedBy} size="sm" />}
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={space.lastModifiedOn && formatDate(space.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Space ID" value={space.id} />
        </RecordIdentifiers>
      </RecordSummary>

      {space.description && (
        <RecordSection title="Description">
          <RecordPanel className="whitespace-pre-wrap text-[13px] text-ink-2">
            {space.description}
          </RecordPanel>
        </RecordSection>
      )}
    </RecordSheet>
  );
};
