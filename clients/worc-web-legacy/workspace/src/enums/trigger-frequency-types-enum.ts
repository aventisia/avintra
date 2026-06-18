export enum TriggerFrequencyTypesEnum {
  // OneTime = "One Time",
  MinuteByMinute = "Minute By Minute", // interval 1-59
  Hourly = "Hourly", // interval 1-23, atTime(only minutes)(00:05)
  Daily = "Day of Month", // interval 1-31, atTime
  Weekly = "Weekly", // Weekdays(multi) 1-7, atTime
  MonthlyDayOfMonth = "Monthly (day of month)", // interval 1-12, MonthDays(multi) 1-31, atTime
  // MonthlyDayOfWeek = "Monthly (day of week)",
}
