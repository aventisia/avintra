import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getFilePathPartFieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The file path to use as the source.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  // output verify the type of output
  {
    name: "rootPath",
    type: "switch",
    label: "RootPath",
    description: "The root path of the source file.",
    defaultValue: "",
  },
  {
    name: "directory",
    type: "switch",
    label: "Directory",
    description: "The directory of the source file.",
    defaultValue: "",
  },
  {
    name: "fileName",
    type: "switch",
    label: "FileName",
    description: "The name of the source file.",
    defaultValue: "",
  },
  {
    name: "fileNameNoExtension",
    type: "switch",
    label: "FileNameNoExtension",
    description: "The name (without the extension) of the source file.",
    defaultValue: "",
  },
  {
    name: "fileExtension",
    type: "switch",
    label: "FileExtension",
    description: "The extension of the source file.",
    defaultValue: "",
  },
];

const getFilePathPartFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filePath"]],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["rootPath"],
      ["directory"],
      ["fileName"],
      ["fileNameNoExtension"],
      ["fileExtension"],
    ],
  },
];

const getFilePathPart: ActivityConfig = {
  fieldList: getFilePathPartFieldList,
  fieldCategories: getFilePathPartFieldCategories,
  fieldsToWatch: [],
};

export default getFilePathPart;
