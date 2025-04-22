import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const readXmlFromFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The file that contains the XML document to read",
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
  // Output
  {
    name: "o_xmlDocumentOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The variable that holds the read XML document",
    defaultValue: "XmlDocument",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_xmlDocumentSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_xmlDocumentSwitch",
    type: "output-switch-field",
    label: "XmlDocument",
    defaultValue: true,
  },
];

const readXmlFromFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filePath"], ["encoding"]],
  },

  {
    title: "Output",
    formFieldKeys: [["o_xmlDocumentOutput", "o_xmlDocumentSwitch"]],
  },
];

const readXmlFromFile: ActivityConfig = {
  fieldList: readXmlFromFileFieldList,
  fieldCategories: readXmlFromFileFieldCategories,
  fieldsToWatch: ["o_xmlDocumentOutput", "o_xmlDocumentSwitch"],
};

export default readXmlFromFile;
