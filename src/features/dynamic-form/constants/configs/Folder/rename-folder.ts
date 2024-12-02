import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const renameFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "folderToRename",
    type: "text",
    label: "Folder to rename",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to change its name",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "newFolderName",
    type: "text",
    label: "New folder name",
    description: "Enter the new name for the folder",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  //   output 
  {
    name: "renamedFolder",
    type: "switch",
    label: "RenamedFolder",
    description: "The renamed folder object",
    defaultValue: "",
  },
];

const renameFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["folderToRename"], ["newFolderName"]],
  },
  {
    title: "Output",
    formFieldKeys: [["renamedFolder"]],
  },
];

const renameFolder: ActivityConfig = {
  fieldList: renameFolderFieldList,
  fieldCategories: renameFolderFieldCategories,
  fieldsToWatch: [],
};

export default renameFolder;