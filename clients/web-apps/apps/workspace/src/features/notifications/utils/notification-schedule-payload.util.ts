import { NotificationRecurrenceEnum } from "@avplatform/ui/enums";

import { CreateNotificationDto } from "../dtos/create-notification.dto";

type NotificationScheduleFormValues = {
  scheduledFor?: Date;
  recurrenceFrequency?: NotificationRecurrenceEnum;
  recurrenceInterval?: number;
  recurrenceWeekdays?: string[];
  recurrenceMonthDays?: string[];
  recurrenceEndOn?: Date;
};

type NotificationSchedulePayload = Pick<
  CreateNotificationDto,
  | "scheduledFor"
  | "recurrenceFrequency"
  | "recurrenceInterval"
  | "recurrenceWeekdays"
  | "recurrenceMonthDays"
  | "recurrenceEndOn"
>;

/** Maps the compose form's schedule and recurrence values to their request payload fields. */
export const buildNotificationSchedulePayload = (
  formData: NotificationScheduleFormValues,
): NotificationSchedulePayload => ({
  scheduledFor: formData.scheduledFor ? formData.scheduledFor.toISOString() : undefined,
  recurrenceFrequency:
    formData.recurrenceFrequency && formData.recurrenceFrequency !== NotificationRecurrenceEnum.None
      ? formData.recurrenceFrequency
      : undefined,
  recurrenceInterval: formData.recurrenceInterval,
  recurrenceWeekdays:
    formData.recurrenceFrequency === NotificationRecurrenceEnum.Weekly &&
    formData.recurrenceWeekdays &&
    formData.recurrenceWeekdays.length > 0
      ? formData.recurrenceWeekdays.map(Number)
      : undefined,
  recurrenceMonthDays:
    formData.recurrenceFrequency === NotificationRecurrenceEnum.Monthly &&
    formData.recurrenceMonthDays &&
    formData.recurrenceMonthDays.length > 0
      ? formData.recurrenceMonthDays.map(Number)
      : undefined,
  recurrenceEndOn: formData.recurrenceEndOn ? formData.recurrenceEndOn.toISOString() : undefined,
});
