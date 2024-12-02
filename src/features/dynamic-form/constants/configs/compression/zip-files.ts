import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";
const zipFilesFieldList: IDynamicFieldSchema[] = [
  {
    name: "archivePath",
    type: "text",
    label: "Archive path",
    description:
      "The full path of zip file to create. If the file already exists, this action adds the new zipped files and/or to the existing zip file. If the zip file already contains a file or folder with the same name, it will be overwritten.",
    defaultValue: "",
  },
  {
    name: "filesToZip",
    type: "text",
    label: "File(s) to zip",
    description:
      "The full path of the file(s) or folder(s) to include in the zip file",
    defaultValue: "",
  },
  {
    name: "compressionLevel",
    type: "select",
    label: "Compression level",
    selectOptions: [
      {
        label: "None",
        value: "none",
      },
      { label: "Best speed", value: "bestSpeed" },
      {
        label: "Best balance of speed and compression",
        value: "bestBalance",
      },
      { label: "Best compression", value: "bestCompression" },
    ],
    description:
      "The level of compression to use. The higher the compression the smaller the file, though it takes longer to create or access",
    defaultValue: "bestBalance",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    description:
      "The password to use for protecting the zip. Leave this attribute blank to create a non password-protected zip",
    defaultValue: "",
  },
  {
    name: "archiveComment",
    type: "text",
    label: "Archive comment",
    description: "The comment to include in the zip file as a file property",
    defaultValue: "",
  },
  //output
  {
    name: "zipFile",
    type: "switch",
    label: "ZipFile",
    description: "The zip file created by this action",
    defaultValue: true,
  },
];

const zipFilesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["archivePath"],
      ["filesToZip"],
      ["compressionLevel"],
      ["password"],
      ["archiveComment"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["zipFile"]],
  },
];

const zipFilesFieldsToWatch: string[] = [];

const zipFiles: ActivityConfig = {
  fieldList: zipFilesFieldList,
  fieldCategories: zipFilesFieldCategories,
  fieldsToWatch: zipFilesFieldsToWatch,
};

export default zipFiles;
