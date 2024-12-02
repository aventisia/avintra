import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const deleteFtpFileFieldList: IDynamicFieldSchema[] = [
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
    name: "filesToDelete",
    type: "text",
    label: "Files to delete",

    description: "The files to delete",
    defaultValue: "",
  },
];

const deleteFtpFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["FTPConnection"], ["filesToDelete"]],
  },
];

const deleteFtpFile: ActivityConfig = {
  fieldList: deleteFtpFileFieldList,
  fieldCategories: deleteFtpFileFieldCategories,
  fieldsToWatch: [],
};

export default deleteFtpFile;
