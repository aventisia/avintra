import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const readTextFromFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The file to read.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "storeContentAs",
    type: "select",
    label: "Store content as",
    description:
      "Specifies how to store the text. Choose 'Single text value' to store the entire text as a single text value. Choose 'List' to store each line of the original text as a text item in a list.",
    selectOptions: [
      { label: "Single text value", value: "singleTextValue" },
      { label: "List (each is a list item)", value: "list" },
    ],
    defaultValue: "singleTextValue",
    regOptions: {
      required: true,
    },
  },
  {
    name: "encoding",
    type: "select",
    label: "Encoding",
    description:
      "The encoding to read the specified text from the text file with.",
    selectOptions: [
      { label: "System Default", value: "systemDefault" },
      { label: "UTF-8", value: "utf8" },
      { label: "Unicode", value: "unicode" },
      { label: "Unicode (big endian)", value: "unicodeBigEndian" },
      { label: "ASCII", value: "ascii" },
    ],
    defaultValue: "utf8",
    regOptions: {
      required: true,
    },
  },
];

const readTextFromFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filePath"], ["storeContentAs"], ["encoding"]],
  },
];

const readTextFromFileFieldsToWatch: string[] = [
  "filePath",
  "storeContentAs",
  "encoding",
];

const readTextFromFile: ActivityConfig = {
  fieldList: readTextFromFileFieldList,
  fieldCategories: readTextFromFileFieldCategories,
  fieldsToWatch: readTextFromFileFieldsToWatch,
};

export default readTextFromFile;
