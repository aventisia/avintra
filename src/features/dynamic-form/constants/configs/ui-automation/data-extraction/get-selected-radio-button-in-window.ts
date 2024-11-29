import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const getSelectedRadioButtonInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The radio button or radio button group",
    defaultValue: "",
  },
  {
    name: "operation", // to watch
    type: "select",
    label: "Operation",
    description:
      "Specify whether to retrieve the name of the radio button that's selected inside a group of radio buttons or just the state of a single radio button",
    selectOptions: [
      {
        label: "Get selected radio button in group",
        value: "selectedRadioButtons",
      },
      { label: "Get state of radio button", value: "stateOfRadioButton" },
    ],
    defaultValue: "selectedRadioButtons",
  },
  {
    name: "bringToFront",
    type: "switch",
    label: "Bring to front",
    description:
      "Specify whether the window containing the Ul element should be brought to the front during execution. If this option is disabled, the action will be executed in the background. Note that not all Ul elements may be compatible with having the option disabled. Additionally, if execution of the action requires scrolling, disabling this option may not extract all elements.",
    defaultValue: true,
  },
  //output
  {
    name: "selectedRadioButton",
    type: "switch",
    label: "selectedRadioButton",
    description: "The selected radio button inside the specified radio group",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "selectedRadioButtons" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "isChecked",
    type: "switch",
    label: "IsChecked",
    description: "The state of the selected radio button",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "stateOfRadioButton" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const getSelectedRadioButtonInWindowFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["uiElement"], ["operation"], ["bringToFront"]],
    },
    {
      title: "Output",
      formFieldKeys: [["selectedRadioButton", "isChecked"]],
    },
  ];
const getSelectedRadioButtonInWindowFieldsToWatch: string[] = ["operation"];

const getSelectedRadioButtonInWindow: ActivityConfig = {
  fieldList: getSelectedRadioButtonInWindowFieldList,
  fieldCategories: getSelectedRadioButtonInWindowFieldCategories,
  fieldsToWatch: getSelectedRadioButtonInWindowFieldsToWatch,
};

export default getSelectedRadioButtonInWindow;
