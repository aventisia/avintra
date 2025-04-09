import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const uploadFoldersToFtpFieldList: IDynamicFieldSchema[] = [
  {
    name: "FTPConnection",
    type: "text",
    label: "FTP connection",
    description:
      "The FTP connection to work with. This variable must have been previously specified in an Open FTP connection action",
    defaultValue: "",
  },

  {
    name: "file(s)ToUpload",
    type: "text",
    label: "File(s) to download",

    description:
      "The folder(s) to upload. The folders being uploaded shouldn't already exist within the active directory of the FTP server",
    defaultValue: "",
  },
  {
    name: "remoteLocation",
    type: "text",
    label: "RemoteLocation",

    description: "The location where the folders should be uploaded",
    defaultValue: "",
  },
];

const uploadFoldersToFtpFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["FTPConnection"], ["file(s)ToUpload"], ["remoteLocation"]],
  },
];

const uploadFoldersToFtp: ActivityConfig = {
  fieldList: uploadFoldersToFtpFieldList,
  fieldCategories: uploadFoldersToFtpFieldCategories,
  fieldsToWatch: [],
};

export default uploadFoldersToFtp;
