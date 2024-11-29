import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const deleteFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "folderToDelete",
    type: "text",
    label: "Folder to delete",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to delete",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
];

const deleteFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["folderToDelete"]],
  },
];


const deleteFolder: ActivityConfig = {
  fieldList: deleteFolderFieldList,
  fieldCategories: deleteFolderFieldCategories,
  fieldsToWatch: [],
};

export default deleteFolder;
