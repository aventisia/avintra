import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getXMLElementValueFieldList: IDynamicFieldSchema[] = [
  {
    name: "XMLDocument",
    type: "select",
    label: "XML document",
    description: "The XML document or XML element to retrieve its value",
    selectOptions: [
        
      ],
    defaultValue: "",
  },
  {
    name: "XPathQuery",
    type: "text",
    label: "XPath query",
    description:
      "The XPath expression to locate the subelement and retrieve its value",
    defaultValue: "",
  },
  {
    name: "getValueAs",
    type: "select",
    label: "Get value as",
    description: "Specifies the data type for the XML element value",
    selectOptions: [
      { label: "Text value", value: "Text value" },
      { label: "Numeric value", value: "Numeric value" },
      { label: "Datetime value", value: "Datetime value" },
      { label: "Boolean value", value: "Boolean value" },
    ],
    defaultValue: "Text value",
  },
  // Output
  {
    name: "o_XmlElementValueOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The XML element value",
    defaultValue: "XmlElementValue",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_XmlElementValueSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_XmlElementValueSwitch",
    type: "output-switch-field",
    label: "XmlElementValue",
    defaultValue: true,
  },
  // {
  //   name: "XmlElementValue",
  //   type: "date",
  //   label: "XmlElementValue",
  //   description:
  //     "The XML element value",
  //   defaultValue: "",
  // },
  // {
  //   name: "XmlElementValue",
  //   type: "number",
  //   label: "XmlElementValue",
  //   description:
  //     "The XML element value",
  //   defaultValue: "",
  // },
  // {
  //     name: "XmlElementValue",
  //     type: "text",
  //     label: "XmlElementValue",
  //     description:
  //       "The XML element value",
  //     defaultValue: "",
  //   },
];

const getXMLElementValueFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["XMLDocument"], ["XPathQuery"], ["getValueAs"]],
  },

  {
    title: "Output",
    formFieldKeys: [["o_XmlElementValueOutput", "o_XmlElementValueSwitch"]],
  },
];

const getXMLElementValue: ActivityConfig = {
  fieldList: getXMLElementValueFieldList,
  fieldCategories: getXMLElementValueFieldCategories,
  fieldsToWatch: ["o_XmlElementValueOutput", "o_XmlElementValueSwitch"],
};

export default getXMLElementValue;
