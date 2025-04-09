import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const listFtpDirectoryFieldList: IDynamicFieldSchema[] = [
  {
    name: "connection",
    type: "text",
    label: "Connection",
    description: "The FTP connection",
    defaultValue: "",
  },
  {
    name: "path",
    type: "text",
    label: "Path",
    description: "EThe path that you want to list.",
    defaultValue: "",
  },
  {
    name: "directories",
    type: "switch",
    label: "Directories",
    description: "The listed directories",
    defaultValue: false,
  },
  {
    name: "files",
    type: "switch",
    label: "Files",
    description: "The listed files",
    defaultValue: false,
  },
];

const listFtpDirectoryFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["connection"], ["path"]],
  },
  {
    title: "Output",
    formFieldKeys: [["directories"], ["files"]],
  },
];

const listFtpDirectory: ActivityConfig = {
  fieldList: listFtpDirectoryFieldList,
  fieldCategories: listFtpDirectoryFieldCategories,
  fieldsToWatch: [],
};

export default listFtpDirectory;
