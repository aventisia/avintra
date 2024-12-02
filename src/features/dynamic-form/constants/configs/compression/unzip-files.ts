import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";
const unzipFilesFieldList: IDynamicFieldSchema[] = [
  {
    name: "archivePath",
    type: "text",
    label: "Archive path",
    description: "The full path of zip file to extract",
    defaultValue: "",
  },
  {
    name: "destinationFolder",
    type: "text",
    label: "Destination folder",
    description:
      "The full path of the folder to extract the archive to. This overwrites files in the folder with the same name as a file in the archive",
    defaultValue: "",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    description:
      "The password, if any, that is used for this archive. If the zip file isn't password-protected, leave this blank",
    defaultValue: "",
  },
  {
    name: "includeMask",
    type: "text",
    label: "Include mask",
    description:
      "The filter to limit the files extracted to those entered here. This allows wild cards, for example '*.txt' or 'document?.doc' (without the quotes). To allow multiple file filters, separate the choices with a semi-colon, for instance,'*.txt;*.exe'",
    defaultValue: "",
  },
  {
    name: "excludeMask",
    type: "text",
    label: "Exclude mask",
    description:
      "Specify the filter to limit the extracted files. This allows wild cards, for example, '*.txt' or 'document?.doc' (without the quotes). To allow multiple file filters, separate the choices with a semi-colon, for instance,'*.txt;*.exe'",
    defaultValue: "",
  },
];

const unzipFilesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["archivePath"],
      ["destinationFolder"],
      ["password"],
      ["includeMask"],
      ["excludeMask"],
    ],
  },
];

const unzipFilesFieldsToWatch: string[] = [];

const unzipFiles: ActivityConfig = {
  fieldList: unzipFilesFieldList,
  fieldCategories: unzipFilesFieldCategories,
  fieldsToWatch: unzipFilesFieldsToWatch,
};

export default unzipFiles;
