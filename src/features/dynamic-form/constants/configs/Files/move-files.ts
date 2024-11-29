import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const moveFilesFieldList: IDynamicFieldSchema[] = [
  {
    name: "filesToMove",
    type: "text",
    label: "File(s) to move",
    description:
      "The file(s) to move. This can be a path, or a variable containing a file, a list of files, a textual path, or a list of text paths. Use the 'Get files in folder' action to populate a variable with a list of files.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "destinationFolder",
    type: "text",
    label: "Destination folder",
    description: "The destination folder for the moved files",
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
    name: "movedFiles",
    type: "switch",
    label: "MovedFiles",
    description: "The moved file(s) as a list of files",
    defaultValue: "",
  },
];

const moveFilesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filesToMove"], ["destinationFolder"], ["ifFileExists"]],
  },
  {
    title: "Output",
    formFieldKeys: [["movedFiles"]],
  },
];



const moveFiles: ActivityConfig = {
  fieldList: moveFilesFieldList,
  fieldCategories: moveFilesFieldCategories,
  fieldsToWatch: [],
};

export default moveFiles;
