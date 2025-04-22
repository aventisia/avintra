import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const ifFolderExistFieldList: IDynamicFieldSchema[] = [
  {
    name: "ifFolder",
    type: "select",
    label: "If folder",
    description: "Choose the state of folder to check",

    defaultValue: "exists",
    selectOptions: [
      { label: "Exists", value: "exists" },
      { label: "Does not exists", value: "does not exists" },
    ],

    regOptions: {
      required: true,
    },
  },
  {
    name: "folderPath",
    type: "text",
    label: "Folder path",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to check its state",
    defaultValue: "",
  },

];

const ifFolderExistFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["ifFolder"], ["folderPath"]],
  },
];

const ifFolderExists: ActivityConfig = {
  fieldList: ifFolderExistFieldList,
  fieldCategories: ifFolderExistFieldCategories,
  fieldsToWatch: [],
};

export default ifFolderExists;
