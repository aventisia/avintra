import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const renameFilesFieldList: IDynamicFieldSchema[] = [
  {
    name: "fileToRename",
    type: "text",
    label: "File to rename",
    description:
      "The file(s) to rename. This can be a path, or a variable containing a file, a list of files, a textual path, or a list of text paths. Use the 'Get files in folder' action to populate a variable with a list of files.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "showSelect",
    type: "switch",
    label: "",
    description: "",
    defaultValue: false,
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
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "showSelect", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  // output 
  {
    name: "RenamedFiles",
    type: "switch",
    label: "RenamedFiles",
    description: "The renamed file(s) as a list files",
    defaultValue: "",
  },
];

const renameFilesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["fileToRename"], ["showSelect"], ["ifFileExists"]],
  },
  {
    title: "Output",
    formFieldKeys: [["RenamedFiles"]],
  },
];

const renameFiles: ActivityConfig = {
  fieldList: renameFilesFieldList,
  fieldCategories: renameFilesFieldCategories,
  fieldsToWatch: ["showSelect"],
};

export default renameFiles;
