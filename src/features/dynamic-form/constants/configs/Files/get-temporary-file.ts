import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getTemporaryFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "tempFile",
    type: "switch",
    label: "TempFile",
    description: "The temporary file object.",
    defaultValue: "",
  },
];

const getTemporaryFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["tempFile"]],
  },
];

const getTemporaryFile: ActivityConfig = {
  fieldList: getTemporaryFileFieldList,
  fieldCategories: getTemporaryFileFieldCategories,
  fieldsToWatch: [],
};

export default getTemporaryFile;
