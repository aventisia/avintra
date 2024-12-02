import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const executexPathExpressionFieldList: IDynamicFieldSchema[] = [
  {
    name: "XMLDocumentToParse",
    type: "text",
    label: "XML document to parse",
    description:
      "The XML as text or a previously defined variable that contains the XML document to parse",
    defaultValue: "",
  },
  {
    name: "xPathQuery",
    type: "text",
    label: "XPath query",
    description: "The XPath expression to execute against the XML document",
    
    defaultValue: "",
  },
  {
    name: "getFirstValueOnly",
    type: "switch",
    label: "Get first value only",
    description:
      "Specifies whether to retrieve a single value (the first value only) or all the values that match the provided XPath expression",
    defaultValue: false,
  },
  {
    name: "xPathResult",
    type: "switch",
    label: "XPathResult",
    description:
      "The extracted node(s) as an XML node",
    defaultValue: false,
  },
  {
    name: "XPathResults",
    type: "switch",
    label: "XPathResults",
    description:
      "The extracted node(s) as a list of XML nodes",
    defaultValue: false,
  },
];

const executexPathExpressionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["xMLDocumentToParse"], ["xPathQuery"],["getFirstValueOnly"]],
  },

  {
    title: "Output",
    formFieldKeys: [["XPathResults"]],
  },
];

const executexPathExpression: ActivityConfig = {
  fieldList: executexPathExpressionFieldList,
  fieldCategories: executexPathExpressionFieldCategories,
  fieldsToWatch: [],
};

export default executexPathExpression;
