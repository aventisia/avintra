import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const displaySelectFromListDialogFieldList: IDynamicFieldSchema[] = [
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
    name: "listToChooseFrom",
    type: "textarea",
    label: "List to choose from",
    description:
      "The list to display as a drop-down menu for the user to choose from",
    defaultValue: "",
  },
  {
    name: "keepSelectDialogAlwaysOnTop",
    type: "switch",
    label: "Keep select dialog always on top",
    description:
      "Specify whether the select dialog should always remain on top of all other windows",
    defaultValue: false,
  },
  {
    name: "limitToList", //to watch
    type: "switch",
    label: "Limit to list",
    description:
      "Whether to allow the user to enter their own answer outside of the list being displayed",
    defaultValue: true,
  },
  {
    name: "allowEmptySelection",
    type: "switch",
    label: "Allow empty selection",
    description:
      "Allow the user to not select anything, creating an empty selected item output",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "limitToList", value: true }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "allowMultipleSelections", //to watch
    type: "switch",
    label: "Allow multiple selections",
    description:
      "Allow the user to select more than one choice. The selected item and selected index variables will hold a list of items",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "limitToList", value: true }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "preselectItemsStartingWithPlusSign",
    type: "switch",
    label: "Preselect items starting with a + sign",
    description:
      "Specify whether the items with a prepended '+' sign will appear automatically preselected",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "limitToList", value: true },
              { key: "allowMultipleSelections", value: true },
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "selectedItem",
    type: "switch",
    label: "SelectedItem",
    description: "The item selected from the list as text",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "allowMultipleSelections", value: false },
              { key: "limitToList", value: false },
            ],
            logicalOperator: "OR",
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "selectedItems",
    type: "switch",
    label: "SelectedItems",
    description: "The items selected from the list as a list of text",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "limitToList", value: true },
              { key: "allowMultipleSelections", value: true },
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "selectedIndex",
    type: "switch",
    label: "SelectedIndex",
    description:
      "The index number of the item selected from the list. You can use the item number instead of the full text of your choice",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "allowMultipleSelections", value: false },
              { key: "limitToList", value: false },
            ],
            logicalOperator: "OR",
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "selectedIndexes",
    type: "switch",
    label: "SelectedIndexes",
    description:
      "The index number of the items selected from the list. This parameter allows you to use the item number instead of the full text of your choice",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "limitToList", value: true },
              { key: "allowMultipleSelections", value: true },
            ],
            logicalOperator: "AND",
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
    description: "The name of the button pressed by the user (OK or Cancel)",
    defaultValue: true,
  },
];

const displaySelectFromListDialogFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["dialogTitle"],
      ["dialogMessage"],
      ["listToChooseFrom"],
      ["keepSelectDialogAlwaysOnTop"],
      ["limitToList"],
      ["allowEmptySelection"],
      ["allowMultipleSelections"],
      ["preselectItemsStartingWithPlusSign"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["selectedItem"],
      ["selectedItems"],
      ["selectedIndex"],
      ["selectedIndexes"],
      ["buttonPressed"],
    ],
  },
];

const displaySelectFromListDialogFieldsToWatch: string[] = [
  "limitToList",
  "allowMultipleSelections",
];
const displaySelectFromListDialog: ActivityConfig = {
  fieldList: displaySelectFromListDialogFieldList,
  fieldCategories: displaySelectFromListDialogFieldCategories,
  fieldsToWatch: displaySelectFromListDialogFieldsToWatch,
};

export default displaySelectFromListDialog;
