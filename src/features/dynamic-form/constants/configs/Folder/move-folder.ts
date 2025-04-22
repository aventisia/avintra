import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const moveFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "folderToMove",
    type: "text",
    label: "Folder to move",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to move",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "destinationFolder",
    type: "text",
    label: "Destination folder",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to be the destination folder",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  //   output 
  {
    name: "o_movedFolderOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The moved folder object(which is a representation and can access the folder and all its information)",
    defaultValue: "MovedFolder",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_movedFolderSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_movedFolderSwitch",
    type: "output-switch-field",
    label: "MovedFolder",
    defaultValue: true,
  },
];

const moveFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["folderToMove"], ["destinationFolder"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_movedFolderOutput", "o_movedFolderSwitch"]],
  },
];

const moveFolder: ActivityConfig = {
  fieldList: moveFolderFieldList,
  fieldCategories: moveFolderFieldCategories,
  fieldsToWatch: ["o_movedFolderOutput", "o_movedFolderSwitch"],
};

export default moveFolder;