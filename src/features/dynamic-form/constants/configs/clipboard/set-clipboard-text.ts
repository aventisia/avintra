import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const setClipboardTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "clipboardText",
    type: "textarea",
    label: "ClipboardText",
    description: "The text to set to the clipboard",
    defaultValue: "",
  },
];

const setClipboardTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["clipboardText"]],
  },
];

const setClipboardTextFieldsToWatch: string[] = [];

const setClipboardText: ActivityConfig = {
  fieldList: setClipboardTextFieldList,
  fieldCategories: setClipboardTextFieldCategories,
  fieldsToWatch: setClipboardTextFieldsToWatch,
};

export default setClipboardText;
