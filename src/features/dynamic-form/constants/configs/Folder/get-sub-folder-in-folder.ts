import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getSubFoldersInFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "folder",
    type: "text",
    label: "Folder",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to retrieve the lists subfolders from",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "folderFilter",
    type: "text",
    label: "Folder filter",
    description: "Filter to apply to the folders. Default is '*'.",
    defaultValue: "*",
    regOptions: {
      required: false,
    },
  },
  {
    name: "includeSubfolders",
    type: "switch",
    label: "Include subfolders",
    description: "Toggle to include subfolders in the retrieval.",
    defaultValue: false,
  },
  // advance
  {
    name: "failUponDeniedAccessToAnySubfolder",
    type: "switch",
    label: "Fail upon denied access to any subfolder",
    description:
      "Specify whether to throw an error when trying to get subfolders of a folder with no access rights or ignore those folders",
    defaultValue: false,
  },
  {
    name: "sortBy",
    type: "select",
    label: "Sort by",
    selectOptions: [
      { label: "No Sort", value: "No Sort" },
      { label: "Full name", value: "Full name" },
      { label: "Root path", value: "Root path" },
      { label: "Directory", value: "Directory" },
      { label: "Name", value: "Name" },
      { label: "Name without extension", value: "Name without extension" },
      { label: "Extension", value: "Extension" },
      { label: "Size", value: "Size" },
      { label: "Creation time", value: "Creation time" },
      { label: "Last accessed", value: "Last accessed" },
      { label: "Last modified", value: "Last modified" },
      { label: "Is hidden", value: "Is hidden" },
      { label: "Is system", value: "Is system" },
      { label: "Is read-only", value: "Is read-only" },
      { label: "Is archive", value: "Is archive" },
      { label: "Exists", value: "Exists" },
    ],
    description: "Specify whether to sort the results and by which criterion",
    defaultValue: "No Sort",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "failUponDeniedAccessToAnySubfolder", value: true },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "descending",
    type: "switch",
    label: "Descending",
    description:
      "Specify whether to sort items in descending or ascending order",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "failUponDeniedAccessToAnySubfolder", value: true },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "thenBy",
    type: "select",
    label: "Then by",
    selectOptions: [
      { label: "No Sort", value: "No Sort" },
      { label: "Full name", value: "Full name" },
      { label: "Root path", value: "Root path" },
      { label: "Directory", value: "Directory" },
      { label: "Name", value: "Name" },
      { label: "Name without extension", value: "Name without extension" },
      { label: "Extension", value: "Extension" },
      { label: "Size", value: "Size" },
      { label: "Creation time", value: "Creation time" },
      { label: "Last accessed", value: "Last accessed" },
      { label: "Last modified", value: "Last modified" },
      { label: "Is hidden", value: "Is hidden" },
      { label: "Is system", value: "Is system" },
      { label: "Is read-only", value: "Is read-only" },
      { label: "Is archive", value: "Is archive" },
      { label: "Exists", value: "Exists" },
    ],
    description: "Specify whether to sort the results by a second criterion",
    defaultValue: "No Sort",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "failUponDeniedAccessToAnySubfolder", value: true },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  //   outputs
  {
    name: "folders",
    type: "switch",
    label: "Folders",
    description: "List of subfolder objects.",
    defaultValue: false,
  },
];

const getSubFoldersInFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["folder"], ["folderFilter"], ["includeSubfolders"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["failUponDeniedAccessToAnySubfolder"],
      ["sortBy"],
      ["descending"],
      ["thenBy"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["folders"]],
  },
];


const getSubFoldersInFolder: ActivityConfig = {
  fieldList: getSubFoldersInFolderFieldList,
  fieldCategories: getSubFoldersInFolderFieldCategories,
  fieldsToWatch: [
    "failUponDeniedAccessToAnySubfolder",
  ],
};

export default getSubFoldersInFolder;