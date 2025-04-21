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
    name: "o_copiedFolderOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The copied folder object",
    defaultValue: "CopiedFolder",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_copiedFolderSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_copiedFolderSwitch",
    type: "output-switch-field",
    label: "CopiedFolder",
    defaultValue: true,
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
    formFieldKeys: [["o_copiedFolderOutput", "o_copiedFolderSwitch"]],
  },
];

const copyFolder: ActivityConfig = {
  fieldList: copyFolderFieldList,
  fieldCategories: copyFolderFieldCategories,
  fieldsToWatch: ["o_copiedFolderOutput", "o_copiedFolderSwitch"],
};

export default copyFolder;
