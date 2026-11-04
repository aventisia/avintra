import {
  DeliveryChannelEnum,
  NotificationRecurrenceEnum,
  NotificationTypesEnum,
} from "@avplatform/ui/enums";
import { ISelectOption } from "@avplatform/ui/types";

export const NOTIFICATION_TYPE_OPTIONS: ISelectOption[] = Object.values(NotificationTypesEnum).map(
  (value) => ({ value, label: value }),
);

export const DELIVERY_CHANNEL_OPTIONS: ISelectOption[] = Object.values(DeliveryChannelEnum).map(
  (value) => ({ value, label: value }),
);

export const RECURRENCE_OPTIONS: ISelectOption[] = Object.values(NotificationRecurrenceEnum).map(
  (value) => ({ value, label: value }),
);

export const WEEKDAY_OPTIONS: ISelectOption[] = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

export const MONTH_DAY_OPTIONS: ISelectOption[] = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
