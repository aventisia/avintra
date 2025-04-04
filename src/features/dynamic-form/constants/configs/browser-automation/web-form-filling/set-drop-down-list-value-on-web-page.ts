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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "select options by name" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "useRegularExpressions",
    type: "switch",
    label: "Use regular expressions",
    description: "",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "select options by name" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "optionIndices",
    type: "number",
    label: "Option indices",
    description:
      "	Enter an index or a list of indices to be selected in the drop-down list. Multiple options make sense only when working with multi-selection lists. If the list is single-selection, then only the first option of the list specified will be used.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "select options by index" }],
          },
        ],
        initialState: false,
      },
    },
  },
  
  {
    name: "waitForPageToLoad",
    type: "switch",
    label: "Wait for page to load",
    description:
      "Specify whether to wait for the new web page to load completely after setting the check box state",
    defaultValue: true,
  },
  {
    name: "timeoutForWebpageToLoad",
    type: "number",
    label: "Timeout for webpage to load",
    description:
      "Set the time in seconds for page to load before the action throws an error",
    defaultValue: 60,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "waitForPageToLoad", value: true }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "ifAPop-UpDialogAppears",
    type: "select",
    label: "If a pop-up dialog appears",
    description: "",
    selectOptions: [
      { label: "Close it", value: "close it" },
      { label: "Press a button", value: "press a button" },
      { label: "Do nothing", value: "do nothing" },
    ],
    defaultValue: "do nothing",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "waitForPageToLoad", value: true }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "dialogButtonToPress",
    type: "text",
    label: "Dialog button to press",
    description: "	Enter the dialog button to press if a pop-up dialog appears",
    defaultValue: "OK",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitForPageToLoad", value: true },
              { key: "ifAPop-UpDialogAppears", value: "press a button" },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
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
      ],
    },
    {
      title: "Advacned",
      formFieldKeys: [
        ["waitForPageToLoad"],
        ["timeoutForWebpageToLoad"],
        ["ifAPop-UpDialogAppears"],
        ["dialogButtonToPress"],
      ]
    }
  ];

const setDropDownListValueOnWebPage: ActivityConfig = {
  fieldList: setDropDownListValueOnWebPageFieldList,
  fieldCategories: setDropDownListValueOnWebPageFieldCategories,
  fieldsToWatch: ["operation", "waitForPageToLoad", "ifAPop-UpDialogAppears"],
};

export default setDropDownListValueOnWebPage;
