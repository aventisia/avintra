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
    name: "selectedCheckboxes",
    type: "switch",
    label: "selectedCheckboxes",
    description:
      "The names of selected checkboxes inside the specified checkbox group",
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
    name: "isChecked",
    type: "switch",
    label: "IsChecked",
    description: "The state of the selected checkbox",
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
      formFieldKeys: [["selectedCheckboxes", "isChecked"]],
    },
  ];
const getSelectedCheckboxesInWindowFieldsToWatch: string[] = ["operation"];

const getSelectedCheckboxesInWindow: ActivityConfig = {
  fieldList: getSelectedCheckboxesInWindowFieldList,
  fieldCategories: getSelectedCheckboxesInWindowFieldCategories,
  fieldsToWatch: getSelectedCheckboxesInWindowFieldsToWatch,
};

export default getSelectedCheckboxesInWindow;
