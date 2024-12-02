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
    name: "movedFolder",
    type: "switch",
    label: "MovedFolder",
    description: "The moved folder object",
    defaultValue: "",
  },
];

const moveFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["folderToMove"], ["destinationFolder"]],
  },
  {
    title: "Output",
    formFieldKeys: [["movedFolder"]],
  },
];

const moveFolder: ActivityConfig = {
  fieldList: moveFolderFieldList,
  fieldCategories: moveFolderFieldCategories,
  fieldsToWatch: [],
};

export default moveFolder;