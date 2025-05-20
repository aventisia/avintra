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
    name: "o_selectedRadioButtonOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The selected radio button inside the specified radio group",
    defaultValue: "selectedRadioButton",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_selectedRadioButtonSwitch", value: false }],
          },
        ],
        initialState: false,
      },
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
    name: "o_selectedRadioButtonSwitch",
    type: "output-switch-field",
    label: "selectedRadioButton",
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
    name: "o_isCheckedOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The state of the selected checkbox",
    defaultValue: "IsChecked",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_isCheckedSwitch", value: false }],
          },
        ],
        initialState: false,
      },
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
  {
    name: "o_isCheckedSwitch",
    type: "output-switch-field",
    label: "IsChecked",
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
      formFieldKeys: [
        ["o_selectedRadioButtonOutput", "o_selectedRadioButtonSwitch"],
        ["o_isCheckedOutput", "o_isCheckedSwitch"]
      ],
    },
  ];
const getSelectedRadioButtonInWindowFieldsToWatch: string[] = ["operation", "o_selectedRadioButtonOutput", "o_selectedRadioButtonSwitch", "o_isCheckedOutput", "o_isCheckedSwitch"];

const getSelectedRadioButtonInWindow: ActivityConfig = {
  fieldList: getSelectedRadioButtonInWindowFieldList,
  fieldCategories: getSelectedRadioButtonInWindowFieldCategories,
  fieldsToWatch: getSelectedRadioButtonInWindowFieldsToWatch,
};

export default getSelectedRadioButtonInWindow;
