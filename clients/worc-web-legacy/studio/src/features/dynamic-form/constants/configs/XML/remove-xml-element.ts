import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const removeXmlElementFieldList: IDynamicFieldSchema[] = [
  {
    name: "XMLDocument",
    type: "text",
    label: "XML document",
    description: "The XML document that contains the XML element(s) to remove",
    defaultValue: "",
  },
  {
    name: "XPathQuery",
    type: "text",
    label: "XPath query",
    description: "The XPath expression to locate the element(s) to remove",
    defaultValue: "",
  },
];

const removeXmlElementFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["XMLDocument"], ["XPathQuery"]],
  },
];

const removeXmlElement: ActivityConfig = {
  fieldList: removeXmlElementFieldList,
  fieldCategories: removeXmlElementFieldCategories,
  fieldsToWatch: [],
};

export default removeXmlElement;
