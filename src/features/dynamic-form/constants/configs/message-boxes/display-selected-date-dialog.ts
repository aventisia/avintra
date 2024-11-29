import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const displaySelectDateDialogFieldList: IDynamicFieldSchema[] = [
  {
    name: "dialogTitle",
    type: "text",
    label: "Dialog title",
    description: "The dialog title",
    defaultValue: "",
  },
  {
    name: "dialogMessage",
    type: "text",
    label: "Dialog message",
    description: "The dialog message",
    defaultValue: "",
  },
  {
    name: "dialogType", //to watch
    type: "select",
    label: "Dialog type",
    description:
      "Whether the user will enter a single date or two dates as the endpoints of a range of dates",
    selectOptions: [
      { label: "Single date", value: "Single date" },
      { label: "Date range (two Dates)", value: "Date range (two Dates)" },
    ],
    defaultValue: "Single date",
  },
  {
    name: "promptFor",
    type: "select",
    label: "Prompt for",
    description:
      "Specify whether the user will enter the date only or the date and time",
    selectOptions: [
      { label: "Date only", value: "Date only" },
      { label: "Date and time", value: "Date and time" },
    ],
    defaultValue: "Date only",
  },
  {
    name: "defaultValue",
    type: "text",
    label: "Default value",
    description: "The default value for the date",
    defaultValue: "",
  },
  {
    name: "defaultValueForSecondDate",
    type: "text",
    label: "Default value for second date",
    description: "The default value for the end date in a range",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "dialogType", value: "Date range (two Dates)" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "keepDateSelectionDialogAlwaysOnTop",
    type: "switch",
    label: "Keep date selection dialog always on top",
    description:
      "Specify whether the date selection dialog should always remain on top of all other windows",
    defaultValue: false,
  },
  {
    name: "selectedDate",
    type: "switch",
    label: "SelectedDate",
    description: "The date entered by the user or the default date",
    defaultValue: true,
  },
  {
    name: "secondSelectedDate",
    type: "switch",
    label: "SecondSelectedDate",
    description: "The second date entered by the user or that default date",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "dialogType", value: "Date range (two Dates)" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "buttonPressed",
    type: "switch",
    label: "ButtonPressed",
    description:
      "The text of the button pressed by the user. The user will automatically be given the choice of OK or Cancel",
    defaultValue: true,
  },
];

const displaySelectDateDialogFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["dialogTitle"],
      ["dialogMessage"],
      ["dialogType"],
      ["promptFor"],
      ["defaultValue"],
      ["defaultValueForSecondDate"],
      ["keepDateSelectionDialogAlwaysOnTop"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["selectedDate"],
      ["secondSelectedDate"],
      ["buttonPressed"],
    ],
  },
];

const displaySelectDateDialogFieldsToWatch: string[] = ["dialogType"];

const displaySelectDateDialog: ActivityConfig = {
  fieldList: displaySelectDateDialogFieldList,
  fieldCategories: displaySelectDateDialogFieldCategories,
  fieldsToWatch: displaySelectDateDialogFieldsToWatch,
};

export default displaySelectDateDialog;
