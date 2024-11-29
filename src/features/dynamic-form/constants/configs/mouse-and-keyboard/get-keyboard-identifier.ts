import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getKeyboardIdentifierFieldList: IDynamicFieldSchema[] = [
  {
    name: "keyboardLayoutId",
    type: "switch",
    label: "Keyboard Layout ID",
    description: "The registry key of the active keyboard identifier.",
    defaultValue: true,
  },
];
const getKeyboardIdentifierFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["keyboardLayoutId"]],
  },
];
const getKeyboardIdentifier: ActivityConfig = {
  fieldList: getKeyboardIdentifierFieldList,
  fieldCategories: getKeyboardIdentifierFieldCategories,
  fieldsToWatch: [],
};

export default getKeyboardIdentifier;
