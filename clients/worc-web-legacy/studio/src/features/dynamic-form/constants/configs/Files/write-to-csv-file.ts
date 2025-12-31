import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const writeToCSVFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "variableToWrite",
    type: "text",
    label: "Variable to write",
    description:
      "The data table, data row variable or list variable to write into the target CSV file",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description:
      "The CSV file to export the variable to. This can be a file path, or a variable containing a file or a textual path",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "encoding",
    type: "select",
    label: "Encoding",
    description: "The encoding to use for writing the specified CSV file",
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
    defaultValue: "utf8",
  },
  // advanced
  {
    name: "includeColumnNames",
    type: "switch",
    label: "Include column names",
    description:
      "Specifies whether the column names of the variant specified should become the very first row of the CSV file.",
    defaultValue: false,
  },
  {
    name: "ifFileExists",
    type: "select",
    label: "If file exists",
    description:
      "Specifies the desired behavior when the targeted CSV file already exists in the filesystem",
    selectOptions: [
      { label: "Overwrite existing content", value: "overwrite" },
      { label: "Append content", value: "append" },
    ],
    defaultValue: "overwrite",
  },
  {
    name: "customColumnSeparator",
    type: "text",
    label: "Custom column separator",
    description:
      "The custom column separator to use in the csv file",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useCustomColumnsSeparator", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "separator",
    type: "select",
    label: "Separator",
    description: "The column-separator to parse the CSV file",
    selectOptions: [
      { label: "System default", value: "systemDefault" },
      { label: "Comma", value: "comma" },
      { label: "Semicolon", value: "semicolon" },
      { label: "Tab", value: "tab" },
    ],
    defaultValue: "systemDefault",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useCustomColumnsSeparator", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "useCustomColumnsSeparator",
    type: "switch",
    label: "Use custom columns separator",
    description:
      "Specifies whether to use a custom column separator or predefined separator",
    defaultValue: false,
  },
];

const writeToCSVFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["variableToWrite"], ["filePath"], ["encoding"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["includeColumnNames"],
      ["ifFileExists"],
      ["separator"],
      ["customColumnSeparator"],
      ["useCustomColumnsSeparator"],
    ],
  },
];


const writeToCSVFile: ActivityConfig = {
  fieldList: writeToCSVFileFieldList,
  fieldCategories: writeToCSVFileFieldCategories,
  fieldsToWatch: ["useCustomColumnsSeparator"],
};

export default writeToCSVFile;
