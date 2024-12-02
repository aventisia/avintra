import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const downloadFoldersFromFtpFieldList: IDynamicFieldSchema[] = [
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
    name: "folder(s)ToDownload",
    type: "text",
    label: "Folder(s) to download",

    description: "The name of the folder path(s), or FTP folder(s) to download",
    defaultValue: "",
  },

  {
    name: "downloadIntoLocalFolder",
    type: "text",
    label: "Download into local folder",

    description:
      "The full path of the destination of the FTP folder(s) you're downloading",
    defaultValue: "",
  },
];

const downloadFoldersFromFtpFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["FTPConnection"],
      ["folder(s)ToDownload"],
      ["downloadIntoLocalFolder"],
    ],
  },
];

const downloadFoldersFromFtp: ActivityConfig = {
  fieldList: downloadFoldersFromFtpFieldList,
  fieldCategories: downloadFoldersFromFtpFieldCategories,
  fieldsToWatch: [],
};

export default downloadFoldersFromFtp;
