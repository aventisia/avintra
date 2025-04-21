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
  // Output
  {
    name: "o_fileContentOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The contents as a text",
    defaultValue: "FileContents",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_fileContentSwitch", value: false }],
          },
        ],
        initialState: true,
      },
      requiredBasedOnFields: {
        conditionList : [
          {
            fields: [{key: "storeContentAs", value: "singleTextValue"}]
          }
        ],
        initialState: true
      }
    },
  },
  {
    name: "o_fileContentSwitch", //to watch
    type: "output-switch-field",
    label: "FileContents",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList : [
          {
            fields: [{key: "storeContentAs", value: "singleTextValue"}]
          }
        ],
        initialState: true
      }
    }
  },

  {
    name: "o_fileContentsOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The contents as a list of texts",
    defaultValue: "FileContents",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_fileContentsSwitch", value: false }],
          },
        ],
        initialState: true,
      },
      requiredBasedOnFields: {
        conditionList : [
          {
            fields: [{key: "storeContentAs", value: "list"}]
          }
        ],
        initialState: false
      }
    },
  },
  {
    name: "o_fileContentsSwitch", //to watch
    type: "output-switch-field",
    label: "FileContents",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList : [
          {
            fields: [{key: "storeContentAs", value: "list"}]
          }
        ],
        initialState: false
      }
    }
  },

];

const readTextFromFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filePath"], ["storeContentAs"], ["encoding"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_fileContentOutput", "o_fileContentSwitch"], ["o_fileContentsOutput", "o_fileContentsSwitch"]]
  }
];

const readTextFromFileFieldsToWatch: string[] = [
  "filePath",
  "storeContentAs",
  "encoding",
  "o_fileContentOutput", 
  "o_fileContentSwitch",
  "o_fileContentsOutput", 
  "o_fileContentsSwitch"
];

const readTextFromFile: ActivityConfig = {
  fieldList: readTextFromFileFieldList,
  fieldCategories: readTextFromFileFieldCategories,
  fieldsToWatch: readTextFromFileFieldsToWatch,
};

export default readTextFromFile;
