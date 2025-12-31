import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const ifFileExistsFieldList: IDynamicFieldSchema[] = [
  {
    name: "ifFile",
    type: "select",
    label: "If file",
    description: "Choose the state of the file to check",
    selectOptions: [
      { label: "Exists", value: "exists" },
      { label: "Does not exist", value: "doesNotExist" },
    ],
    defaultValue: "exists",
    regOptions: {
      required: true,
    },
  },
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The full path where to look for the file",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
];

const ifFileExistsFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["ifFile"], ["filePath"]],
  },
];

const ifFileExistsFieldsToWatch: string[] = [];

const ifFileExists: ActivityConfig = {
  fieldList: ifFileExistsFieldList,
  fieldCategories: ifFileExistsFieldCategories,
  fieldsToWatch: ifFileExistsFieldsToWatch,
};

export default ifFileExists;
