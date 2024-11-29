import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const copyFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "folderToCopy",
    type: "text",
    label: "Folder to copy",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to copy",
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
  {
    name: "ifFolderExists",
    type: "select",
    label: "If folder exists",
    selectOptions: [
      { label: "Do nothing", value: "doNothing" },
      { label: "Overwrite", value: "overwrite" },
    ],
    description:
      "Specify whether to overwrite files or not copy them at all, if the destination folder already exists.",
    defaultValue: "doNothing",
    regOptions: {
      required: true,
    },
  },
  // output 
  {
    name: "copiedFolder",
    type: "switch",
    label: "CopiedFolder",
    description: "The copied folder object",
    defaultValue: "",
  },
];

const copyFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["folderToCopy"],
      ["destinationFolder"],
      ["ifFolderExists"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["copiedFolder"]],
  },
];

const copyFolder: ActivityConfig = {
  fieldList: copyFolderFieldList,
  fieldCategories: copyFolderFieldCategories,
  fieldsToWatch: [],
};

export default copyFolder;
