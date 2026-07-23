import { ISelectOption } from "@avplatform/ui/types";
import Enumerable from "linq";
import timezones from "timezones-list";

// Array of days and their corresponding numbers
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const numbers = [1, 2, 3, 4, 5, 6, 7];

// Function to convert weekdays to numbers
function weekdaysToNumbers(weekdaysArray: string[] | undefined): number[] {
  if (!weekdaysArray) return [];
  return weekdaysArray.map((day) => {
    const index = weekdays.indexOf(day);
    if (index !== -1) {
      return numbers[index];
    }
    throw new Error(`Invalid weekday: ${day}`);
  });
}

// Function to convert numbers to weekdays
function numbersToWeekdays(numbersArray: number[] | undefined): string[] {
  if (!numbersArray) return [];
  return numbersArray.map((num) => {
    const index = numbers.indexOf(num);
    if (index !== -1) {
      return weekdays[index];
    }
    throw new Error(`Invalid number: ${num}`);
  });
}

// Generate options for each frequency
const generateMinutesOptions = () =>
  Array.from({ length: 59 }, (_, i) => ({
    label: `${i + 1} minute${i === 0 ? "" : "s"}`,
    value: (i + 1).toString(),
  })) as unknown as ISelectOption[];

const generateHourMinutesOptions = () =>
  Array.from({ length: 59 }, (_, i) => ({
    label: `${i} minute${i === 0 ? "" : "s"}`,
    value: `00:${String(i).padStart(2, "0")}`,
  })) as unknown as ISelectOption[];

const generateMonthOptions = () =>
  Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1} month${i === 0 ? "" : "s"}`,
    value: (i + 1).toString(),
  })) as unknown as ISelectOption[];

const generateDayOfWeekOptions = () => [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const generateDayOfMonthOptions = () =>
  Array.from({ length: 31 }, (_, i) => ({
    label: `Day ${i + 1}`,
    value: (i + 1).toString(),
  })) as unknown as ISelectOption[];

const generateHourlyOptions = () =>
  Array.from({ length: 23 }, (_, i) => {
    const hour = i + 1;

    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? "AM" : "PM";

    return {
      label: `${displayHour} ${period}`,
      value: hour.toString(),
    };
  }) as unknown as ISelectOption[];

const formatHour = (h: number) => {
  const hour = h % 12 === 0 ? 12 : h % 12;
  const period = h < 12 || h === 24 ? "AM" : "PM";
  return `${hour} ${period}`;
};

const generateHourlyWithRangeOptions = () =>
  Array.from({ length: 23 }, (_, i) => {
    const start = i + 1;
    const end = start + 1;

    return {
      label: `${formatHour(start)} to ${formatHour(end)}`,
      value: start.toString(),
    };
  }) as unknown as ISelectOption[];

const timezoneOptions = Enumerable.from(timezones)
  .select<ISelectOption>((t) => ({
    value: t.tzCode,
    label: t.label,
  }))
  .toArray();

//   Extracts time in "HH:mm" format from a Date object
function getTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Updates a Date object with a new time from "HH:mm" string
function setTimeToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);

  // Create a new Date object to avoid mutating the original
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);

  return newDate;
}
export {
  weekdaysToNumbers,
  numbersToWeekdays,
  generateDayOfMonthOptions,
  generateDayOfWeekOptions,
  generateHourlyOptions,
  generateHourlyWithRangeOptions,
  generateHourMinutesOptions,
  generateMinutesOptions,
  generateMonthOptions,
  timezoneOptions,
  getTimeFromDate,
  setTimeToDate,
};
