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
    name: "o_movedFilesOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The moved file(s) as a list of files",
    defaultValue: "MovedFiles",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_movedFilesSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_movedFilesSwitch",
    type: "output-switch-field",
    label: "MovedFiles",
    defaultValue: true,
  },
];

const moveFilesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filesToMove"], ["destinationFolder"], ["ifFileExists"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_movedFilesOutput", "o_movedFilesSwitch"]],
  },
];



const moveFiles: ActivityConfig = {
  fieldList: moveFilesFieldList,
  fieldCategories: moveFilesFieldCategories,
  fieldsToWatch: ["o_movedFilesOutput", "o_movedFilesSwitch"],
};

export default moveFiles;
