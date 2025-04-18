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
  // Output
  {
    name: "o_selectedDateOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The date entered by the user or the default date",
    defaultValue: "SelectedDate",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_selectedDateSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_selectedDateSwitch",
    type: "output-switch-field",
    label: "SelectedDate",
    defaultValue: true,
  },
  //
  {
    name: "o_secondSelectedDateOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The second date entered by the user or that default date",
    defaultValue: "SecondSelectedDate",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_secondSelectedDateSwitch", value: false }],
          },
        ],
        initialState: true,
      },
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
    name: "o_secondSelectedDateSwitch",
    type: "output-switch-field",
    label: "SecondSelectedDate",
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
  //
  {
    name: "o_buttonPressedOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
    "The text of the button pressed by the user. The user will automatically be given the choice of OK or Cancel",    defaultValue: "ButtonPressed",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_buttonPressedSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_buttonPressedSwitch",
    type: "output-switch-field",
    label: "ButtonPressed",
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
      ["o_selectedDateOutput", "o_selectedDateSwitch"],
      ["o_secondSelectedDateOutput", "o_secondSelectedDateSwitch"],
      ["o_buttonPressedOutput", "o_buttonPressedSwitch"],
    ],
  },
];

const displaySelectDateDialogFieldsToWatch: string[] = [
  "dialogType", 
  "o_selectedDateOutput", 
  "o_selectedDateSwitch", 
  "o_secondSelectedDateOutput", 
  "o_secondSelectedDateSwitch", 
  "o_buttonPressedOutput", 
  "o_buttonPressedSwitch"
];

const displaySelectDateDialog: ActivityConfig = {
  fieldList: displaySelectDateDialogFieldList,
  fieldCategories: displaySelectDateDialogFieldCategories,
  fieldsToWatch: displaySelectDateDialogFieldsToWatch,
};

export default displaySelectDateDialog;
