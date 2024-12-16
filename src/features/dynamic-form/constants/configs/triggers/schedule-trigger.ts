import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";
const scheduleTriggerFieldList: IDynamicFieldSchema[] = [
  {
    name: "scheduleCycle", // to watch
    type: "select",
    label: "Schedule Cycle",
    selectOptions: [
      { label: "Interval In Minutes", value: "intervalInMinutes" },
      { label: "Hourly Schedule", value: "hourlySchedule" },
      { label: "Daily Routine", value: "dailyRoutine" },
      { label: "Weekly Plan", value: "weeklyPlan" },
      { label: "Monthly Cycle", value: "monthlyCycle" },
      { label: "Custom Cron", value: "customCron" },
    ],
    description:
      "Choose an option below to set the frequency for your flow execution",
    defaultValue: "intervalInMinutes",
  },
  {
    name: "minutes",
    type: "number",
    label: "Minutes",
    description: "Execute the task at specified minute intervals",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "scheduleCycle", value: "intervalInMinutes" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "runOnWeekends",
    type: "switch",
    label: "Run on weekends",
    description: "Execute the task every hour",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "scheduleCycle", value: "hourlySchedule" },
              { key: "scheduleCycle", value: "dailyRoutine" },
            ],
            logicalOperator: "OR",
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "pickAnHour",
    type: "select",
    label: "Pick an Hour",
    description: "Hour of the day",
    defaultValue: "",
    selectOptions: [
      { label: "12:00 AM", value: "12am" },
      { label: "1:00 AM", value: "1am" },
      { label: "2:00 AM", value: "2am" },
      { label: "3:00 AM", value: "3am" },
      { label: "4:00 AM", value: "4am" },
      { label: "5:00 AM", value: "5am" },
      { label: "6:00 AM", value: "6am" },
      { label: "7:00 AM", value: "7am" },
      { label: "8:00 AM", value: "8am" },
      { label: "9:00 AM", value: "9am" },
      { label: "10:00 AM", value: "10am" },
      { label: "11:00 AM", value: "11am" },
      { label: "12:00 PM", value: "12pm" },
      { label: "1:00 PM", value: "1pm" },
      { label: "2:00 PM", value: "2pm" },
      { label: "3:00 PM", value: "3pm" },
      { label: "4:00 PM", value: "4pm" },
      { label: "5:00 PM", value: "5pm" },
      { label: "6:00 PM", value: "6pm" },
      { label: "7:00 PM", value: "7pm" },
      { label: "8:00 PM", value: "8pm" },
      { label: "9:00 PM", value: "9pm" },
      { label: "10:00 PM", value: "10pm" },
      { label: "11:00 PM", value: "11pm" },
    ],
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "scheduleCycle", value: "dailyRoutine" },
              { key: "scheduleCycle", value: "weeklyPlan" },
              { key: "scheduleCycle", value: "monthlyCycle" },
            ],
            logicalOperator: "OR",
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "timeZone",
    type: "select",
    label: "Time zone",
    description: "Time zone",
    defaultValue: "",
    selectOptions: [
      { label: "Eastern Standard Time (EST)", value: "est" },
      { label: "Central Standard Time (CST)", value: "cst" },
      { label: "Mountain Standard Time (MST)", value: "mst" },
      { label: "Pacific Standard Time (PST)", value: "pst" },
      { label: "Greenwich Mean Time (GMT)", value: "gmt" },
      { label: "British Summer Time (BST)", value: "bst" },
      { label: "Central European Time (CET)", value: "cet" },
      { label: "Eastern European Time (EET)", value: "eet" },
      { label: "India Standard Time (IST)", value: "ist" },
      { label: "China Standard Time (CST)", value: "cst_china" },
      { label: "Japan Standard Time (JST)", value: "jst" },
      { label: "Australian Eastern Standard Time (AEST)", value: "aest" },
      { label: "Australian Central Standard Time (ACST)", value: "acst" },
      { label: "New Zealand Standard Time (NZST)", value: "nzst" },
    ],
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "scheduleCycle", value: "dailyRoutine" },
              { key: "scheduleCycle", value: "weeklyPlan" },
              { key: "scheduleCycle", value: "monthlyCycle" },
            ],
            logicalOperator: "OR",
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "dayOfTheWeek",
    type: "select",
    label: "Day of the week",
    description: "Day of the week",
    defaultValue: "",
    selectOptions: [
      { label: "Sunday", value: "sunday" },
      { label: "Monday", value: "monday" },
      { label: "Tuesday", value: "tuesday" },
      { label: "Wednesday", value: "wednesday" },
      { label: "Thursday", value: "thursday" },
      { label: "Friday", value: "friday" },
      { label: "Saturday", value: "saturday" },
    ],
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "scheduleCycle", value: "weeklyPlan" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "dayOfTheMonth",
    type: "select",
    label: "Day of the month",
    description: "Day of the month",
    defaultValue: "",
    selectOptions: [
      { label: "1", value: "day1" },
      { label: "2", value: "day2" },
      { label: "3", value: "day3" },
      { label: "4", value: "day4" },
      { label: "5", value: "day5" },
      { label: "6", value: "day6" },
      { label: "7", value: "day7" },
      { label: "8", value: "day8" },
      { label: "9", value: "day9" },
      { label: "10", value: "day10" },
      { label: "11", value: "day11" },
      { label: "12", value: "day12" },
      { label: "13", value: "day13" },
      { label: "14", value: "day14" },
      { label: "15", value: "day15" },
      { label: "16", value: "day16" },
      { label: "17", value: "day17" },
      { label: "18", value: "day18" },
      { label: "19", value: "day19" },
      { label: "20", value: "day20" },
      { label: "21", value: "day21" },
      { label: "22", value: "day22" },
      { label: "23", value: "day23" },
      { label: "24", value: "day24" },
      { label: "25", value: "day25" },
      { label: "26", value: "day26" },
      { label: "27", value: "day27" },
      { label: "28", value: "day28" },
      { label: "29", value: "day29" },
      { label: "30", value: "day30" },
      { label: "31", value: "day31" },
    ],
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "scheduleCycle", value: "monthlyCycle" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "customDate",
    type: "date",
    label: "Custom date",
    description: "Day of the month",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "scheduleCycle", value: "customCron" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const scheduleTriggerFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["scheduleCycle"],
      ["minutes"],
      ["dayOfTheWeek"],
      ["dayOfTheMonth"],
      ["customDate"],
      ["pickAnHour"],
      ["timeZone"],
      ["runOnWeekends"],
    ],
  },
];

const scheduleTriggerFieldsToWatch: string[] = ["scheduleCycle"];

const scheduleTrigger: ActivityConfig = {
  fieldList: scheduleTriggerFieldList,
  fieldCategories: scheduleTriggerFieldCategories,
  fieldsToWatch: scheduleTriggerFieldsToWatch,
};

export default scheduleTrigger;
