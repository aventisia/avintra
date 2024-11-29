import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const setDropdownListValueInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "dropdownList",
    type: "ui-element-selector",
    label: "Drop-down list",
    description: "The drop-down list whose value to set",
    defaultValue: "",
  },
  {
    name: "operation", //to watch
    type: "select",
    label: "Operation",
    description:
      "Specify whether you want to select a value by name or by ordinal position (1 2 3 ...) or clear the selected value of the dropdown list",
    selectOptions: [
      { label: "Clear selected options", value: "clearSelectedOptions" },
      { label: "Select options by name", value: "selectOptionsByName" },
      { label: "Select options by index", value: "selectOptionsByIndex" },
    ],
    defaultValue: "clearSelectedOptions",
  },
  {
    name: "optionNames",
    type: "text",
    label: "Option names",
    description:
      "Enter an option or a list of options to be selected in the drop-down list. Multiple options make sense only when working with multi-selection lists. If the list is single-selection, then only the first option of the list specified will be used.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "selectOptionsByName" }],
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
    description:
      "Specify whether the option names values to interpret as a regular expression",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "selectOptionsByName" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "optionIndices",
    type: "text",
    label: "Option indices",
    description:
      "Enter an index or a list of indices to be selected in the drop-down list. Multiple options make sense only when working with multi-selection lists. If the list is single-selection, then only the first option of the list specified will be used.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "operation", value: "selectOptionsByIndex" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const setDropdownListValueInWindowFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["dropdownList"],
        ["operation"],
        ["optionNames"],
        ["useRegularExpressions"],
        ["optionIndices"],
      ],
    },
  ];
const setDropdownListValueInWindowFieldsToWatch: string[] = ["operation"];

const setDropdownListValueInWindow: ActivityConfig = {
  fieldList: setDropdownListValueInWindowFieldList,
  fieldCategories: setDropdownListValueInWindowFieldCategories,
  fieldsToWatch: setDropdownListValueInWindowFieldsToWatch,
};

export default setDropdownListValueInWindow;
