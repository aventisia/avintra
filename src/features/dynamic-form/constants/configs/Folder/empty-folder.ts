import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const emptyFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "folderToEmpty",
    type: "text",
    label: "Folder to empty",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to delete its contents",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
];

const emptyFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["folderToEmpty"]],
  },
];

const emptyFolder: ActivityConfig = {
  fieldList: emptyFolderFieldList,
  fieldCategories: emptyFolderFieldCategories,
  fieldsToWatch: [],
};

export default emptyFolder;
