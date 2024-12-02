import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const setDropDownListValueOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "select",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "select",
    label: "UI element",
    description: "	Select the UI element on web page to capture",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "operation",
    type: "select",
    label: "Operation",
    description:
      "Select whether to select a value or clear the selected value of the drop-down list",
    selectOptions: [
      { label: "Clear all options", value: "clear all options" },
      { label: "Select options by name", value: "select options by name" },
      { label: "Select options by index", value: "select options by index" },
    ],
    defaultValue: "clear all options",
  },
  {
    name: "optionNames",
    type: "text",
    label: "Option names",
    description:
      "	Enter an option or a list of options to be selected in the drop-down list. Multiple options make sense only when working with multi-selection lists. If the list is single-selection, then only the first option of the list specified will be used.",
    defaultValue: "",
  },
  {
    name: "useRegularExpressions",
    type: "switch",
    label: "Use regular expressions",
    description: "",
    defaultValue: false,
  },
  {
    name: "optionIndices",
    type: "number",
    label: "Option indices",
    description:
      "	Enter an index or a list of indices to be selected in the drop-down list. Multiple options make sense only when working with multi-selection lists. If the list is single-selection, then only the first option of the list specified will be used.",
    defaultValue: "",
  },
  {
    name: "waitForPageToLoad",
    type: "switch",
    label: "Wait for page to load",
    description:
      "Specify whether to wait for the new web page to load completely after selecting the radio button",
    defaultValue: true,
  },
  {
    name: "timeoutForWebpageToLoad",
    type: "number",
    label: "Timeout for webpage to load",
    description:
      "Set the time in seconds for page to load before the action throws an error",
    defaultValue: "60",
  },
  {
    name: "ifAoPop-UpDialogAppears",
    type: "select",
    label: "If a pop-up dialog appears",
    description:
      "Specify what to do if a pop-up dialog appears after populating the text field",
    selectOptions: [
      { label: "Close it, Press a button", value: "close it, Press a button" },
      { label: "Do nothing", value: "do nothing" },
    ],
    defaultValue: "do nothing",
  },
  {
    name: "dialogButtonToPress",
    type: "text",
    label: "Dialog button to press",
    description: "The dialog button to press if a pop-up dialog appears",
    defaultValue: "ok",
  },
];

const setDropDownListValueOnWebPageFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["webBrowserInstance"],
        ["uIElement"],
        ["operation"],
        ["optionNames"],
        ["useRegularExpressions"],
        ["optionIndices"],
        ["waitForPageToLoad"],
        ["timeoutForWebpageToLoad"],
        ["ifAoPop-UpDialogAppears"],
        ["dialogButtonToPress"],
      ],
    },
  ];

const setDropDownListValueOnWebPage: ActivityConfig = {
  fieldList: setDropDownListValueOnWebPageFieldList,
  fieldCategories: setDropDownListValueOnWebPageFieldCategories,
  fieldsToWatch: [],
};

export default setDropDownListValueOnWebPage;
