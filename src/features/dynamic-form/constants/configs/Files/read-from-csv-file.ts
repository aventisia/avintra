import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const readFromCSVFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description:
      "The CSV file to read. This can be a file path, or a variable containing a file or a textual path",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "encoding",
    type: "select",
    label: "Encoding",
    description: "The encoding to use for reading the specified CSV file",
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
  //   Advanced
  {
    name: "trimFields",
    type: "switch",
    label: "Trim Fields",
    description:
      "Specifies whether to automatically trim off the leading and trailing whitespace of the extracted cells",
    defaultValue: false,
  },
  {
    name: "firstLineContainsColumnNames",
    type: "switch",
    label: "First line contains column names",
    description:
      "Specifies whether to use the first row of the CSV resources to set the column names of the resulting data table.",
    defaultValue: false,
  },
  {
    name: "columnsSeparator",
    type: "select",
    label: "Columns separator",
    description:
      "Specifies whether to use a predefined columns separator, a custom one or fixed column widths",
    selectOptions: [
      { label: "Predefined", value: "predefined" },
      { label: "Custom", value: "custom" },
      { label: "Fixed column widths", value: "fixedWidths" },
    ],
    defaultValue: "predefined",
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
    defaultValue: "comma",
  },
  //   output 
  {
    name: "CSVTable",
    type: "switch",
    label: "CSVTable",
    description: "The contents of the CSV files as a data table",
    defaultValue: "",
  },
];

const readFromCSVFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filePath"], ["encoding"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["trimFields"],
      ["firstLineContainsColumnNames"],
      ["columnsSeparator"],
      ["separator"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["CSVTable"]],
  },
];
const readFromCSVFileFieldsToWatch: string[] = [];
const readFromCSVFile: ActivityConfig = {
  fieldList: readFromCSVFileFieldList,
  fieldCategories: readFromCSVFileFieldCategories,
  fieldsToWatch: readFromCSVFileFieldsToWatch,
};

export default readFromCSVFile;
