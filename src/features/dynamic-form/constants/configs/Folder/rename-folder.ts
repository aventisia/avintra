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
    name: "o_renamedFolderOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The renamed folder object(which is a representation and can access the folder and all its information)",
    defaultValue: "RenamedFolder",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_renamedFolderSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_renamedFolderSwitch",
    type: "output-switch-field",
    label: "RenamedFolder",
    defaultValue: true,
  },
];

const renameFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["folderToRename"], ["newFolderName"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_renamedFolderOutput", "o_renamedFolderSwitch"]],
  },
];

const renameFolder: ActivityConfig = {
  fieldList: renameFolderFieldList,
  fieldCategories: renameFolderFieldCategories,
  fieldsToWatch: ["o_renamedFolderOutput", "o_renamedFolderSwitch"],
};

export default renameFolder;