import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const attachToRunningWordFieldList: IDynamicFieldSchema[] = [
  {
    name: "documentName",
    type: "select",
    label: "Document name",
    description: "The name or path of the Word document to attach to",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "wordInstance",
    type: "switch",
    label: "WordInstance",
    description:
      "The Word instance this action has attached to for use with later Word actions",
    defaultValue: "",
  },
];

const attachToRunningWordFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["documentName"]],
  },
  {
    title: "Output",
    formFieldKeys: [["wordInstance"]],
  },
];

const attachToRunningWord: ActivityConfig = {
  fieldList: attachToRunningWordFieldList,
  fieldCategories: attachToRunningWordFieldCategories,
  fieldsToWatch: [],
};

export default attachToRunningWord;
