import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const blockInputField: IDynamicFieldSchema[] = [
  {
    name: "blockInput",
    type: "switch",
    label: "Block Input",
    description: "Specify whether to block or unblock mouse and keyboard input",
    defaultValue: true,
  },
];

const blockInputFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["blockInput"]],
  },
  {
    title: "Output",
    formFieldKeys: [[""], [""]],
  },
];

const blockInput: ActivityConfig = {
  fieldList: blockInputField,
  fieldCategories: blockInputFieldCategories,
  fieldsToWatch: [],
};

export default blockInput;
