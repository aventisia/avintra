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
  // Output
  {
    name: "o_XPathResultsOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The extracted node(s) as a list of XML nodes",
    defaultValue: "XPathResults",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_XPathResultsSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_XPathResultsSwitch",
    type: "output-switch-field",
    label: "XPathResults",
    defaultValue: true,
  },
];

const executexPathExpressionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["XMLDocumentToParse"], ["xPathQuery"],["getFirstValueOnly"]],
  },

  {
    title: "Output",
    formFieldKeys: [["o_XPathResultsOutput", "o_XPathResultsSwitch"]],
  },
];

const executexPathExpression: ActivityConfig = {
  fieldList: executexPathExpressionFieldList,
  fieldCategories: executexPathExpressionFieldCategories,
  fieldsToWatch: ["o_XPathResultsOutput", "o_XPathResultsSwitch"],
};

export default executexPathExpression;
