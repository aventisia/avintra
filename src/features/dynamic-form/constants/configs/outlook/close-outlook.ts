import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const closeOutLookFieldList: IDynamicFieldSchema[] = [
  {
    name: "outlookInstance",
    type: "text",
    label: "Outlook instance",
    description:
      "The Outlook instance to work with. This variable is specified in a 'Launch Outlook' action",
    defaultValue: "",
  },
];

const closeOutLookFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["outlookInstance"]],
  },
];
const closeOutLook: ActivityConfig = {
  fieldList: closeOutLookFieldList,
  fieldCategories: closeOutLookFieldCategories,
  fieldsToWatch: [],
};

export default closeOutLook;
