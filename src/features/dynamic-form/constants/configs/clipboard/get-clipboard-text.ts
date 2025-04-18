import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const getClipboardTextFieldList: IDynamicFieldSchema[] = [
  //output
  {
    name: "o_clipboardTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The text stored in the clipboard",
    defaultValue: "ClipboardText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_clipboardTextSwitch", value: false }],
          },
        ],
        initialState: true,
      },
  },},
  {
    name: "o_clipboardTextSwitch",
    type: "output-switch-field",
    label: "ClipboardText",
    defaultValue: true,
  },
];

const getClipboardTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "output",
    formFieldKeys: [["o_clipboardTextOutput", "o_clipboardTextSwitch"]],
  },
];

const getClipboardTextFieldsToWatch: string[] = ["o_clipboardTextOutput", "o_clipboardTextSwitch"];

const getClipboardText: ActivityConfig = {
  fieldList: getClipboardTextFieldList,
  fieldCategories: getClipboardTextFieldCategories,
  fieldsToWatch: getClipboardTextFieldsToWatch,
};

export default getClipboardText;
