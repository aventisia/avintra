import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const getSelectedCheckboxesInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The checkbox or checkbox group",
    defaultValue: "",
  },
  {
    name: "operation",// to watch
    type: "select",
    label: "Operation",
    description:
      "Specify whether to retrieve the state of multiple selected checkboxes or just one",
    selectOptions: [
      {
        label: "Get names of selected checkboxes in group",
        value: "namesOfSelectedCheckboxes",
      },
      { label: "Get state of checkbox", value: "stateOfCheckbox" },
    ],
    defaultValue: "namesOfSelectedCheckboxes",
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
    name: "o_selectedCheckboxesOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The names of selected checkboxes inside the specified checkbox group",
    defaultValue: "selectedCheckboxes",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_selectedCheckboxesSwitch", value: false }],
          },
        ],
        initialState: true,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "namesOfSelectedCheckboxes" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_selectedCheckboxesSwitch",
    type: "output-switch-field",
    label: "selectedCheckboxes",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "namesOfSelectedCheckboxes" }],
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
            fields: [{ key: "operation", value: "stateOfCheckbox" }],
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
            fields: [{ key: "operation", value: "stateOfCheckbox" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const getSelectedCheckboxesInWindowFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["uiElement"], ["operation"], ["bringToFront"]],
    },
    {
      title: "Output",
      formFieldKeys: [
        ["o_selectedCheckboxesOutput", "o_selectedCheckboxesSwitch"],  
        ["o_isCheckedOutput",  "o_isCheckedSwitch"]
      ],
    },
  ];
const getSelectedCheckboxesInWindowFieldsToWatch: string[] = ["operation", "o_selectedCheckboxesOutput", "o_selectedCheckboxesSwitch", "o_isCheckedOutput",  "o_isCheckedSwitch"];

const getSelectedCheckboxesInWindow: ActivityConfig = {
  fieldList: getSelectedCheckboxesInWindowFieldList,
  fieldCategories: getSelectedCheckboxesInWindowFieldCategories,
  fieldsToWatch: getSelectedCheckboxesInWindowFieldsToWatch,
};

export default getSelectedCheckboxesInWindow;
