import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const WriteTextToFileActivityFieldList: IDynamicFieldSchema[] = [
  {
    name: "FilePath",
    type: "text",
    label: "File path",
    description:
      "The file to which to write the text. This can be a file path, or a variable containing a file or a textual path",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "TextToWrite",
    type: "textarea",
    label: "Text to write",
    description: "The text to write in the specified file",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "WriteMode",
    type: "select",
    label: "If file exists",
    description:
      "Specifies whether to overwrite the existing content, or to append to the end of the existing content. If the file doesn't exist, this action automatically creates it",
    selectOptions: [
      { label: "Overwrite", value: "Overwrite" },
      { label: "Append", value: "Append" },
    ],
    defaultValue: "Overwrite",
  }
];

const WriteTextToFileActivityFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["FilePath"],
      ["TextToWrite"],
      ["WriteMode"],
    ],
  },
];

const WriteTextToFileActivity: ActivityConfig = {
  fieldList: WriteTextToFileActivityFieldList,
  fieldCategories: WriteTextToFileActivityFieldCategories,
  fieldsToWatch: [],
};

export default WriteTextToFileActivity;
