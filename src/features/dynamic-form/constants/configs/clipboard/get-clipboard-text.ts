import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const getClipboardTextFieldList: IDynamicFieldSchema[] = [
  //output
  {
    name: "clipboardText",
    type: "switch",
    label: "ClipboardText",
    description: "The text stored in the clipboard",
    defaultValue: true,
  },
];

const getClipboardTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "output",
    formFieldKeys: [["clipboardText"]],
  },
];

const getClipboardTextFieldsToWatch: string[] = [];

const getClipboardText: ActivityConfig = {
  fieldList: getClipboardTextFieldList,
  fieldCategories: getClipboardTextFieldCategories,
  fieldsToWatch: getClipboardTextFieldsToWatch,
};

export default getClipboardText;
