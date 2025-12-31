import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const writeXmlToFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The file to write the XML document into",
    defaultValue: "",
  },
  {
    name: "XMLToWrite",
    type: "codeEditor",
    language: "xml",
    label: "XML to write",
    description: "The XML node or document to write into the file",
    defaultValue: "",
  },
  {
    name: "encoding",
    type: "select",
    label: "Encoding",
    description: "The encoding used for the specified file",
    selectOptions: [
      { label: "System default", value: "systemDefault" },
      { label: "ASCII", value: "ASCII" },
      { label: "Unicode", value: "Unicode" },
      { label: "Unicode big endian", value: "unicodeBigEndian" },
      { label: "UTF-8", value: "UTF-8" },
    ],
    defaultValue: "systemDefault",
  },
  {
    name: "formatXML",
    type: "switch",
    label: "Format XML",
    description: "Specifies whether to format the XML",
    defaultValue: true,
  },
  {
    name: "indentationPerLevel",
    type: "number",
    label: "Indentation per level",
    description: "Specifies whether to format the XML",
    defaultValue: 2,
  },
];

const writeXmlToFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["filePath"],
      ["XMLToWrite"],
      ["encoding"],
      ["formatXML"],
      ["indentationPerLevel"],
    ],
  },

  // {
  //   title: "Output",
  //   formFieldKeys: [[]],
  // },
];

const writeXmlToFile: ActivityConfig = {
  fieldList: writeXmlToFileFieldList,
  fieldCategories: writeXmlToFileFieldCategories,
  fieldsToWatch: [],
};

export default writeXmlToFile;
