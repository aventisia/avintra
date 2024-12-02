import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const deleteFtpDirectoryFieldList: IDynamicFieldSchema[] = [
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
    name: "directoryToDelete",
    type: "select",
    label: "Directory to delete",
    selectOptions: [],
    description:
      "The folder to be deleted. Everything in the folder will be deleted as well",
    defaultValue: "",
  },
];

const deleteFtpDirectoryFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["FTPConnection"], ["directoryToDelete"]],
  },
];

const deleteFtpDirectory: ActivityConfig = {
  fieldList: deleteFtpDirectoryFieldList,
  fieldCategories: deleteFtpDirectoryFieldCategories,
  fieldsToWatch: [],
};

export default deleteFtpDirectory;
