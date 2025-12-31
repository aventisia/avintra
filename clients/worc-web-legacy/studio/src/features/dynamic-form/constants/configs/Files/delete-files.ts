import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const deleteFilesFieldList: IDynamicFieldSchema[] = [
  {
    name: "filesToDelete",
    type: "text",
    label: "File(s) to delete",
    description:
      "The file(s) to delete. This can be a path, or a variable containing a file, a list of files, a textual path, or a list of text paths. Use the 'Get files in folder' action to populate a variable with a list of files.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
];

const deleteFilesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filesToDelete"]],
  },
];

const deleteFiles: ActivityConfig = {
  fieldList: deleteFilesFieldList,
  fieldCategories: deleteFilesFieldCategories,
  fieldsToWatch: [],
};

export default deleteFiles;
