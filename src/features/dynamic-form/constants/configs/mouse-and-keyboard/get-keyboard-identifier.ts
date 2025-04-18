import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getKeyboardIdentifierFieldList: IDynamicFieldSchema[] = [
  {
    name: "o_keyboardLayoutIdOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The registry key of the active keyboard identifier.",
    defaultValue: "Keyboard Layout ID",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_keyboardLayoutIdSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_keyboardLayoutIdSwitch",
    type: "output-switch-field",
    label: "Keyboard Layout ID",
    defaultValue: true,
  },
];
const getKeyboardIdentifierFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["o_keyboardLayoutIdOutput", "o_keyboardLayoutIdSwitch"]],
  },
];
const getKeyboardIdentifier: ActivityConfig = {
  fieldList: getKeyboardIdentifierFieldList,
  fieldCategories: getKeyboardIdentifierFieldCategories,
  fieldsToWatch: ["o_keyboardLayoutIdOutput", "o_keyboardLayoutIdSwitch"],
};

export default getKeyboardIdentifier;
