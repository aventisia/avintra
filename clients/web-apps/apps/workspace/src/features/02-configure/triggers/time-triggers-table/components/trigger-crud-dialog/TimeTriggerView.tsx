import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import {
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
  RecordSheet,
  RecordSheetLoading,
  RecordSheetUnavailable,
  RecordStatusHero,
  RecordSummary,
} from "@avplatform/ui/record-sheet";
import { formatDate } from "@avplatform/ui/utils";
import {
  CalendarBlankIcon,
  CalendarCheckIcon,
  CalendarXIcon,
  ClockClockwiseIcon,
  ClockCounterClockwiseIcon,
  ClockIcon,
  GlobeIcon,
  ProhibitIcon,
  RepeatIcon,
  UserCircleIcon,
  UserGearIcon,
} from "@phosphor-icons/react";

import { PersonAvatar } from "@/components/PersonAvatar";

import { TriggerAgentsSection } from "../../../components/TriggerAgentsSection";
import { generateHourlyWithRangeOptions, numbersToWeekdays } from "../../constants/form-utils";
import { useFetchTriggerAgents } from "../../hooks/useFetchTriggerAgents";
import { useFetchTriggers } from "../../hooks/useFetchTriggers";
import {
  describeSchedule,
  getLastRunTime,
  getRunSummary,
  getScheduleStatus,
} from "../../utils/time-trigger-schedule.util";

const EXCEPTION_HOUR_OPTIONS = generateHourlyWithRangeOptions();

type TimeTriggerViewProps = {
  rowId: string;
};

/**
 * Read-only time trigger record: schedule status and next run, schedule facts and audit,
 * identifier and the agents it runs.
 */
export const TimeTriggerView = ({ rowId }: TimeTriggerViewProps) => {
  const { data: triggers, isLoading } = useFetchTriggers();
  const {
    data: agentsResponse,
    isLoading: areAgentsLoading,
    isError: isAgentsError,
  } = useFetchTriggerAgents(rowId);

  const trigger = triggers?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(trigger?.name);

  if (isLoading || areAgentsLoading) {
    return <RecordSheetLoading label="Loading time trigger details..." />;
  }
  if (!trigger) return <RecordSheetUnavailable Icon={ClockIcon} recordLabel="Time trigger" />;

  const status = getScheduleStatus(trigger);
  const run = getRunSummary(trigger, status.hasUpcomingRuns);
  const lastRunTime = getLastRunTime(trigger);
  const agents = agentsResponse?.data ?? [];
  const exceptionHours = trigger.exceptionHours?.map(
    (hour) =>
      EXCEPTION_HOUR_OPTIONS.find((option) => option.value === hour.toString())?.label ?? hour,
  );

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={ClockIcon}
          tone={status.tone}
          title={status.title}
          description={run.description}
          detail={run.detail}
          isMuted={status.tone !== "ok"}
        />
        <RecordFactGrid>
          <RecordFact Icon={RepeatIcon} label="Schedule" value={describeSchedule(trigger)} />
          <RecordFact Icon={GlobeIcon} label="Timezone" value={trigger.timezone} />
          <RecordFact
            Icon={CalendarCheckIcon}
            label="Starts on"
            value={formatDate(trigger.effectiveDate, true)}
          />
          <RecordFact
            Icon={CalendarXIcon}
            label="Ends on"
            value={trigger.endDate && formatDate(trigger.endDate, true)}
          />
          <RecordFact
            Icon={ClockClockwiseIcon}
            label="Last run"
            value={lastRunTime && formatDate(lastRunTime, true)}
          />
          <RecordFact
            Icon={ProhibitIcon}
            label="Skipped hours"
            value={exceptionHours?.join(", ")}
          />
          <RecordFact
            Icon={ProhibitIcon}
            label="Skipped weekdays"
            value={numbersToWeekdays(trigger.exceptionWeekdays).join(", ")}
          />
          <RecordFact
            Icon={ProhibitIcon}
            label="Skipped dates"
            value={trigger.exceptionDates?.join(", ")}
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={trigger.createdBy}
            prefix={trigger.createdBy && <PersonAvatar name={trigger.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={trigger.createdOn && formatDate(trigger.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={trigger.lastModifiedBy}
            prefix={
              trigger.lastModifiedBy && <PersonAvatar name={trigger.lastModifiedBy} size="sm" />
            }
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={trigger.lastModifiedOn && formatDate(trigger.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Trigger ID" value={trigger.id} />
        </RecordIdentifiers>
      </RecordSummary>

      <TriggerAgentsSection agents={agents} isError={isAgentsError} />
    </RecordSheet>
  );
};
