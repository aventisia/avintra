import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const ReadTextFromFileActivityFieldList: IDynamicFieldSchema[] = [
  {
    name: "FilePath",
    type: "text",
    label: "File path",
    description: "The file to read.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "TrimContent",
    type: "switch",
    label: "Trim content",
    description: "Set to true to trim the content after reading",
    defaultValue: false,
  },
  // Output
  {
    name: "o_FileContentOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The text content read from the file",
    defaultValue: "fileContent",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_FileContentSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_FileContentSwitch", //to watch
    type: "output-switch-field",
    label: "FileContents",
    defaultValue: true,
  },
];

const ReadTextFromFileActivityFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["FilePath"], ["TrimContent"]]
  },
  {
    title: "Output",
    formFieldKeys: [["o_FileContentOutput", "o_FileContentSwitch"]]
  }
];

const ReadTextFromFileActivity: ActivityConfig = {
  fieldList: ReadTextFromFileActivityFieldList,
  fieldCategories: ReadTextFromFileActivityFieldCategories,
  fieldsToWatch: ["o_FileContentSwitch"],
};

export default ReadTextFromFileActivity;
