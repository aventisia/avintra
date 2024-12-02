import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const copyFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "filesToCopy",
    type: "text",
    label: "File(s) to copy",
    description:
      "The file(s) to copy. This can be a path, or a variable containing a file, a list of files, a text path, or a list of text paths. Use the 'Get files in folder' action to populate a variable with a list of files.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "destinationFolder",
    type: "text",
    label: "Destination folder",
    description: "The destination folder for the copied files",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "ifFileExists",
    type: "select",
    label: "If file exists",
    description:
      "Specifies what to do if a file with the same name already exists in the destination folder.",
    selectOptions: [
      { label: "Do nothing", value: "doNothing" },
      { label: "Overwrite", value: "overwrite" },
    ],
    defaultValue: "doNothing",
    regOptions: {
      required: true,
    },
  },
  //   output 
  {
    name: "copiedFiles",
    type: "switch",
    label: "CopiedFiles",
    description: "The copied file(s) as a list of files ",
    defaultValue: "",
  },
];

const copyFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filesToCopy"], ["destinationFolder"], ["ifFileExists"]],
  },
  {
    title: "Output",
    formFieldKeys: [["copiedFiles"]],
  },
];

const copyFileFieldsToWatch: string[] = [];

const copyFile: ActivityConfig = {
  fieldList: copyFileFieldList,
  fieldCategories: copyFileFieldCategories,
  fieldsToWatch: copyFileFieldsToWatch,
};

export default copyFile;
