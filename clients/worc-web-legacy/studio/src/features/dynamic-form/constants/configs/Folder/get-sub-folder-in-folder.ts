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
      "Specify whether to throw an error when trying to get files of a folder with no access rights or ignore those folders",
    defaultValue: false,
  },
  {
    name: "sortBy",
    type: "select",
    label: "Sort by",
    selectOptions: [
      { label: "No Sort", value: "noSort" },
      { label: "Full name", value: "fullName" },
      { label: "Root path", value: "rootPath" },
      { label: "Directory", value: "directory" },
      { label: "Name", value: "name" },
      { label: "Name without extension", value: "nameWithoutExtension" },
      { label: "Extension", value: "extension" },
      { label: "Size", value: "size" },
      { label: "Creation time", value: "creationTime" },
      { label: "Last accessed", value: "lastAccessed" },
      { label: "Last modified", value: "lastModified" },
      { label: "Is hidden", value: "isHidden" },
      { label: "Is system", value: "isSystem" },
      { label: "Is read-only", value: "isReadOnly" },
      { label: "Is archive", value: "isArchive" },
      { label: "Exists", value: "exists" },
    ],
    defaultValue: "noSort",
    regOptions: {
      required: true
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
      required: true
    },
  },
  {
    name: "thenBy",
    type: "select",
    label: "Then by",
    selectOptions: [
      { label: "No Sort", value: "noSort" },
      { label: "Full name", value: "fullName" },
      { label: "Root path", value: "rootPath" },
      { label: "Directory", value: "directory" },
      { label: "Name", value: "name" },
      { label: "Name without extension", value: "nameWithoutExtension" },
      { label: "Extension", value: "extension" },
      { label: "Size", value: "size" },
      { label: "Creation time", value: "creationTime" },
      { label: "Last accessed", value: "lastAccessed" },
      { label: "Last modified", value: "lastModified" },
      { label: "Is hidden", value: "isHidden" },
      { label: "Is system", value: "isSystem" },
      { label: "Is read-only", value: "isReadOnly" },
      { label: "Is archive", value: "isArchive" },
      { label: "Exists", value: "exists" },
    ],
    defaultValue: "noSort",
    regOptions: {
      required: true
    },
  },
  {
    name: "descending2",
    type: "switch",
    label: "Descending",
    description:
      "Specify whether to sort items in descending or ascending order",
    defaultValue: false,
    regOptions: {
      required: true
    },
  },
  {
    name: "thenBy2",
    type: "select",
    label: "Then by",
    selectOptions: [
      { label: "No Sort", value: "noSort" },
      { label: "Full name", value: "fullName" },
      { label: "Root path", value: "rootPath" },
      { label: "Directory", value: "directory" },
      { label: "Name", value: "name" },
      { label: "Name without extension", value: "nameWithoutExtension" },
      { label: "Extension", value: "extension" },
      { label: "Size", value: "size" },
      { label: "Creation time", value: "creationTime" },
      { label: "Last accessed", value: "lastAccessed" },
      { label: "Last modified", value: "lastModified" },
      { label: "Is hidden", value: "isHidden" },
      { label: "Is system", value: "isSystem" },
      { label: "Is read-only", value: "isReadOnly" },
      { label: "Is archive", value: "isArchive" },
      { label: "Exists", value: "exists" },
    ],
    defaultValue: "noSort",
    regOptions: {
      required: true
    },
  },
  {
    name: "descending3",
    type: "switch",
    label: "Descending",
    description:
      "Specify whether to sort items in descending or ascending order",
    defaultValue: false,
    regOptions: {
      required: true
    },
  },
  //   outputs
  {
    name: "o_foldersOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The retrieved subfolders as a list of folder objects",
    defaultValue: "Folders",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_foldersSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_foldersSwitch",
    type: "output-switch-field",
    label: "Folders",
    defaultValue: true,
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
      ["descending2"],
      ["thenBy2"],
      ["descending3"]
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_foldersOutput", "o_foldersSwitch"]],
  },
];


const getSubFoldersInFolder: ActivityConfig = {
  fieldList: getSubFoldersInFolderFieldList,
  fieldCategories: getSubFoldersInFolderFieldCategories,
  fieldsToWatch: [
    "failUponDeniedAccessToAnySubfolder",
    "o_foldersOutput", 
    "o_foldersSwitch"
  ],
};

export default getSubFoldersInFolder;