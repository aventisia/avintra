import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const uploadFilesToFtpFieldList: IDynamicFieldSchema[] = [
  {
    name: "FTPConnection",
    type: "text",
    label: "FTP connection",
    description:
      "The FTP connection to work with. This variable must have been previously specified in an Open FTP connection action",
    defaultValue: "",
  },

  {
    name: "file(s)ToDownload",
    type: "text",
    label: "File(s) to download",

    description: "The file(s) to upload",
    defaultValue: "",
  },
  {
    name: "remoteLocation",
    type: "text",
    label: "RemoteLocation",

    description: "The location where the files should be uploaded",
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
      "Enter ASCII or binary to specify the method for downloading a single file. If you're not sure what type the file will be, or if you're downloading more than one, choose Auto to follow the transfer rules specified in Options",
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
      "Specify what to do if the file already exists. Overwrite writes over the original file so you can't access it anymore, and Download with Unique Name adds an underscore and a sequential number to the end",
    defaultValue: "Overwrite",
  },
];

const uploadFilesToFtpFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["FTPConnection"],
      ["file(s)ToDownload"],
      ["remoteLocation"],
      ["transferType"],
      ["ifFileExists"],
    ],
  },
];

const uploadFilesToFtp: ActivityConfig = {
  fieldList: uploadFilesToFtpFieldList,
  fieldCategories: uploadFilesToFtpFieldCategories,
  fieldsToWatch: [],
};

export default uploadFilesToFtp;
