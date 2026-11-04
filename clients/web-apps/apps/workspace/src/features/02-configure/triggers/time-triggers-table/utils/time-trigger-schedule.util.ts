import type { RecordTone } from "@avplatform/ui/record-sheet";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";
import { pluralize } from "@/utils/pluralize.util";

import { numbersToWeekdays } from "../constants/form-utils";
import type { TimeTriggerDto } from "../dtos/time-trigger-dto";

// IMPORTANT NOTE: the backend stamps LastTriggeredTime a few milliseconds after CreatedOn when it
// creates a trigger, so a last run inside this window is the creation stamp, not a run.
const CREATION_STAMP_WINDOW_MS = 1000;

const countOf = (count: number, unit: string) => `${count} ${pluralize(count, unit)}`;

/**
 * Describes the trigger's recurrence in plain words, or `undefined` for an unknown frequency.
 */
export const describeSchedule = (trigger: TimeTriggerDto) => {
  const interval = trigger.interval ?? 1;
  const time = trigger.atTime?.slice(0, 5) ?? "00:00";

  switch (trigger.frequency as unknown as keyof typeof TriggerFrequencyTypesEnum) {
    case "MinuteByMinute":
      return `Every ${countOf(interval, "minute")}`;
    case "Hourly":
      return `Every ${countOf(interval, "hour")} at minute ${time.slice(3)}`;
    case "Daily":
      return `Every ${countOf(interval, "day")} at ${time}`;
    case "Weekly":
      return `${numbersToWeekdays(trigger.weekdays).join(", ")} at ${time}`;
    case "MonthlyDayOfMonth":
      return `Day ${trigger.monthDays?.join(", ")} every ${countOf(interval, "month")} at ${time}`;
    default:
      return undefined;
  }
};

/**
 * Returns the trigger's schedule status label and tone, and whether it still has runs ahead.
 */
export const getScheduleStatus = (
  trigger: TimeTriggerDto,
): { title: string; tone: RecordTone; hasUpcomingRuns: boolean } => {
  const now = new Date();
  if (trigger.isDisabled) return { title: "Disabled", tone: "neutral", hasUpcomingRuns: false };
  if (trigger.endDate && new Date(trigger.endDate) < now)
    return { title: "Ended", tone: "neutral", hasUpcomingRuns: false };
  if (new Date(trigger.effectiveDate) > now)
    return { title: "Scheduled", tone: "neutral", hasUpcomingRuns: true };
  return { title: "Active", tone: "ok", hasUpcomingRuns: true };
};

/**
 * Returns the trigger's last real run time, or `undefined` when it has never run.
 */
export const getLastRunTime = (trigger: TimeTriggerDto) => {
  if (!trigger.lastTriggeredTime) return undefined;
  if (!trigger.createdOn) return trigger.lastTriggeredTime;
  const sinceCreation =
    new Date(trigger.lastTriggeredTime).getTime() - new Date(trigger.createdOn).getTime();
  return sinceCreation > CREATION_STAMP_WINDOW_MS ? trigger.lastTriggeredTime : undefined;
};

/**
 * Summarises the next run when runs are ahead, otherwise the last run or that it never ran.
 */
export const getRunSummary = (trigger: TimeTriggerDto, hasUpcomingRuns: boolean) => {
  if (hasUpcomingRuns && trigger.nextTriggerTime) {
    return {
      description: `Next run ${formatRelativeTime(trigger.nextTriggerTime)}`,
      detail: formatDate(trigger.nextTriggerTime, true),
    };
  }
  const lastRunTime = getLastRunTime(trigger);
  if (lastRunTime) {
    return {
      description: `Last ran ${formatRelativeTime(lastRunTime)}`,
      detail: formatDate(lastRunTime, true),
    };
  }
  return { description: "Never run" };
};
