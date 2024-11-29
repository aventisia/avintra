import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const setXmlElementAttributeFieldList: IDynamicFieldSchema[] = [
    {
      name: "XMLDocument",
      type: "select",
      label: "XML document",
      selectOptions:[],
      description: "The XML document or XML element to set its attribute",
      defaultValue: "",
    },
    {
      name: "XPathQuery",
      type: "text",
      label: "XPath query",
      description: "The XPath expression to locate the subelement and set its attribute",
      defaultValue: "",
    },
    {
      name: "attributeName",
      type: "text",
      label: "Attribute name",
      description: "The name of the attribute to set its value",
      defaultValue: "",
    },
    {
        name: "attributeValue",
        type: "text",
        label: "Attribute Value",
        description: "The new value for the attribute",
        defaultValue: "",
      }
    
  ];
  
  const setXmlElementAttributeFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["XMLDocument"], ["XPathQuery"],["attributeName"],["attributeValue"]],
    },
  
    // {
    //   title: "Output",
    //   formFieldKeys: [[]],
    // },
  ];
  
  const setXmlElementAttribute: ActivityConfig = {
    fieldList: setXmlElementAttributeFieldList,
    fieldCategories: setXmlElementAttributeFieldCategories,
    fieldsToWatch: [],
  };
  
  export default setXmlElementAttribute;
  