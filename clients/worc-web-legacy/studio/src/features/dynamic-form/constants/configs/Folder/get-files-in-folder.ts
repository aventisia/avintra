import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getFilesInFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "folder",
    type: "text",
    label: "Folder",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to retrieve the lists files from",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "filterFolder",
    type: "text",
    label: "File filter",
    description: "Choose a filter to limit files retrieved",
    defaultValue: "",
    regOptions: {
      required: false,
    },
  },
  {
    name: "includesSubFolders",
    type: "switch",
    label: "Includes subfolders",
    description: "Specify whether to look in subfolders as well",
    defaultValue: false,
  },
  // Advance Inputs
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
  //   output
  {
    name: "o_filesOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The retrieved file as a list of file objects",
    defaultValue: "Files",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_filesSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_filesSwitch",
    type: "output-switch-field",
    label: "Files",
    defaultValue: true,
  },
];

const getFilesInFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["folder"], ["filterFolder"], ["includesSubFolders"]],
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
    formFieldKeys: [["o_filesOutput", "o_filesSwitch"]],
  },
];


const getFilesInFolder: ActivityConfig = {
  fieldList: getFilesInFolderFieldList,
  fieldCategories: getFilesInFolderFieldCategories,
  fieldsToWatch: ["failUponDeniedAccessToAnySubfolder", "o_filesOutput", "o_filesSwitch"],
};

export default getFilesInFolder;