import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const convertFileToBase64FieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The file to read from.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  // output 
  {
    name: "base64Text",
    type: "switch",
    label: "Base64Text",
    description: "The Base64 encoded text.",
    defaultValue: "",
  },
];

const convertFileToBase64FieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Input",
    formFieldKeys: [["filePath"]],
  },
  {
    title: "Output",
    formFieldKeys: [["base64Text"]],
  },
];

const convertFileToBase64: ActivityConfig = {
  fieldList: convertFileToBase64FieldList,
  fieldCategories: convertFileToBase64FieldCategories,
  fieldsToWatch: [],
};

export default convertFileToBase64;
