import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getCurrentDateAndTimeFieldList: IDynamicFieldSchema[] = [
  {
    name: "retrieve",
    type: "select",
    label: "Retrieve",
    description:
      "Specify whether to get the date and time, or just the date. If the latter is chosen, the time value will be stored as midnight (0:00:00)",
    selectOptions: [
      { label: "Current date and time", value: "current date and time" },
      { label: "Current date only", value: "current date only" },
    ],
    defaultValue: "current date and time",
  },
  {
    name: "timeZone",
    type: "select",

    label: "Time zone",
    description:
      "Specify whether to use the system's time zone or select a specific one or set up a time zone manually",
    selectOptions: [
      { label: "System time zone", value: "system time zone" },
      {
        label: "Specific time zone (to be deprecated)",
        value: "specific time zone (to be deprecated)",
      },
      { label: "Windows time zone", value: "windows time zone" },
      { label: "Custom input", value: "custom input" },
    ],
    defaultValue: "system time zone",
  },
  {
    name: "country/Region",
    type: "text",
    label: "Country/region",
    description:
      "The country/region to get the time of or add a numeric value as the hours that will be added in the UTC time zone",
    defaultValue: "Europe/Bucharest",
  },
  {
    name: "windowsTimeZone",
    type: "text",

    label: "Windows time zone",
    description: "Specify the country/region to obtain the time zone from",
    defaultValue: "(UTC) Coordinated Universal Time",
  },
  {
    name: "inputType",
    type: "select",

    label: "Input Type",
    description:
      "Choose whether to set the offset via a numeric value or by providing a Windows format time zone",
    selectOptions: [
      { label: "Offset", value: "offset" },
      { label: "Windows time zone", value: "windows time zone" },
    ],
    defaultValue: "offset",
  },
  {
    name: "offset",
    type: "text",
    label: "Offset",
    description:
      "Specify the number of hours the offset is going to be. Time format is UTC.",
    defaultValue: "",
  },
  {
    name: "timeZone",
    type: "text",
    label: "Time zone",
    description: "Specify the time zone (Windows time zone)",
    defaultValue: "",
  },
  {
    name: "currentDateTime",
    type: "switch",
    label: "CurrentDateTime",
    description: "The current datetime value",
    defaultValue: false,
  },
];

const getCurrentDateAndTimeFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["retrieve"],
      ["timeZone"],
      ["country/Region"],
      ["windowsTimeZone"],
      ["inputType"],
      ["offset"],
      ["timeZone"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["currentDateTime"]],
  },
];
const getCurrentDateAndTime: ActivityConfig = {
  fieldList: getCurrentDateAndTimeFieldList,
  fieldCategories: getCurrentDateAndTimeFieldCategories,
  fieldsToWatch: [],
};

export default getCurrentDateAndTime;
