import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const downloadFilesFromFtpFieldList: IDynamicFieldSchema[] = [
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
    name: "downloadIntoFolder",
    type: "text",
    label: "Download into folder",

    description:
      "The folder to be the destination of the file(s) that will be downloaded",
    defaultValue: "",
  },

  {
    name: "file(s)ToDownload",
    type: "text",
    label: "File(s) to download",

    description:
      "Specify what to do if the file already exists. Overwrite writes over the original file so you can't access it anymore, and download with unique name adds an underscore and a sequential number to the end",
    defaultValue: "",
  },
  {
    name: "transferType",
    type: "select",
    label: "Transfer type",
    selectOptions: [
      { label: "Auto", value: "Auto" },
      { label: "Binary", value: "Binary" },
      { label: "ASCII", value: " ASCII" },
    ],

    description:
      "Enter ASCII or binary to specify the method for downloading a single file. If the file type is uncertain, or more than one is downloaded, choose Auto to follow the transfer rules specified in options",
    defaultValue: "Auto",
  },
  {
    name: "ifFileExists",
    type: "select",
    label: "If file exists",
    selectOptions: [
      { label: "Overwrite", value: "Overwrite" },
      { label: "Do not download", value: "Do not download" },
      {
        label: "Download with unique name",
        value: "Download with unique name",
      },
    ],

    description:
      "Specify what to do if the file already exists. Overwrite writes over the original file so you can't access it anymore, and download with unique name adds an underscore and a sequential number to the end",
    defaultValue: "Overwrite",
  },
];

const downloadFilesFromFtpFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["FTPConnection"],
      ["downloadIntoFolder"],
      ["file(s)ToDownload"],
      ["transferType"],
      ["ifFileExists"],
    ],
  },
];

const downloadFilesFromFtp: ActivityConfig = {
  fieldList: downloadFilesFromFtpFieldList,
  fieldCategories: downloadFilesFromFtpFieldCategories,
  fieldsToWatch: [],
};

export default downloadFilesFromFtp;
