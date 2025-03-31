import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const writeTextToFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
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
    name: "textToWrite",
    type: "textarea",
    label: "Text to write",
    description: "The text to write in the specified file",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "appendNewLine",
    type: "switch",
    label: "Append new line",
    description: "Specifies whether to append a new line at the end of the overall text to write to the file",
    defaultValue: true,
  },
  {
    name: "ifFileExists",
    type: "select",
    label: "If file exists",
    description:
      "Specifies whether to overwrite the existing content, or to append to the end of the existing content. If the file doesn't exist, this action automatically creates it",
    selectOptions: [
      { label: "Overwrite existing content", value: "overwrite" },
      { label: "Append content", value: "append" },
    ],
    defaultValue: "overwrite",
  },
  {
    name: "encoding",
    type: "select",
    label: "Encoding",
    description:
      "The encoding to use for the specified text to write into text file",
    selectOptions: [
      { label: "System Default", value: "systemDefault" },
      { label: "UTF-8", value: "utf8" },
      { label: "Unicode", value: "unicode" },
      { label: "Unicode (big endian)", value: "unicodeBigEndian" },
      { label: "UTF-8 (without byte order mask)", value: "utf8WithoutBom" },
      {
        label: "Unicode (without byte order mask)",
        value: "unicodeWithoutBom",
      },
      { label: "ASCII", value: "ascii" },
    ],
    defaultValue: "unicode",
  },
];

const writeTextToFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["filePath"],
      ["textToWrite"],
      ["appendNewLine"],
      ["ifFileExists"],
      ["encoding"],
    ],
  },
];

const writeTextToFile: ActivityConfig = {
  fieldList: writeTextToFileFieldList,
  fieldCategories: writeTextToFileFieldCategories,
  fieldsToWatch: [],
};

export default writeTextToFile;
