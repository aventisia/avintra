import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const renameFtpFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "FTPConnection",
    type: "select",
    label: "FTP connection",
    selectOptions: [],

    description:
      "The FTP connection to work with. This variable must have been previously specified in an Open FTP connection action",
    defaultValue: "",
  },

  {
    name: "fileToRename",
    type: "select",
    label: "File to rename",
    selectOptions: [],

    description: "The files to rename",
    defaultValue: "",
  },

  {
    name: "newFileName",
    type: "text",
    label: "New file name",

    description:
      "The new name for the file. If you enter a name with a path, the file will also be moved to that location. If the location doesn't exist, it will throw an exception",
    defaultValue: "",
  },
];

const renameFtpFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["FTPConnection"], ["fileToRename"], ["newFileName"]],
  },
];

const renameFtpFile: ActivityConfig = {
  fieldList: renameFtpFileFieldList,
  fieldCategories: renameFtpFileFieldCategories,
  fieldsToWatch: [],
};

export default renameFtpFile;
