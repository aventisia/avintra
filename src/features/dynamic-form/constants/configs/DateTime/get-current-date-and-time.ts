import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
import { WindowsTimeZonesEnum } from "@/react-toolkit/enums/windows-timezone-enums";

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
      { label: "Windows time zone", value: "windows time zone" },
      { label: "Custom input", value: "custom input" },
    ],
    defaultValue: "system time zone",
  },
  {
    name: "windowsTimeZone",
    type: "select",
    label: "Windows time zone",
    description: "Specify the country/region to obtain the time zone from",
    selectOptions: Object.keys(WindowsTimeZonesEnum).map(key => {
      return {
        label: WindowsTimeZonesEnum[key as keyof typeof WindowsTimeZonesEnum],
        value: key
      };
    }),
    defaultValue: "UTC",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "timeZone", value: "windows time zone" }],
          },
        ],
        initialState: false,
      },
    },
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "timeZone", value: "custom input" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "offset",
    type: "text",
    label: "Offset",
    description:
      "Specify the number of hours the offset is going to be. Time format is UTC.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "timeZone", value: "custom input" }, 
              {key: "inputType", value:"offset"}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "timezoneInput",
    type: "text",
    label: "Time zone",
    description:
      "Specify the time zone (Windows time zone).",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "inputType", value: "windows time zone" },               
              { key: "timeZone", value: "custom input" }, 
            ],
            logicalOperator:"AND"
          },
        ],
        initialState: false,
      },
    },
  },

  // Output
  {
    name: "o_currentDateTimeOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The current datetime value",
    defaultValue: "CurrentDateTime",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_currentDateTimeSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_currentDateTimeSwitch",
    type: "output-switch-field",
    label: "CurrentDateTime",
    defaultValue: true,
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
      ["timezoneInput"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_currentDateTimeOutput", "o_currentDateTimeSwitch"]],
  },
];
const getCurrentDateAndTime: ActivityConfig = {
  fieldList: getCurrentDateAndTimeFieldList,
  fieldCategories: getCurrentDateAndTimeFieldCategories,
  fieldsToWatch: ["timeZone", "inputType", "o_currentDateTimeOutput", "o_currentDateTimeSwitch"],
};

export default getCurrentDateAndTime;
