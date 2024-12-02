import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const removeXMLElementAttributeFieldList: IDynamicFieldSchema[] = [
    {
      name: "XMLDocument",
      type: "select",
      label: "XML document",
      selectOptions: [  
      ],
      description: "The XML document or XML element to remove its attribute",
      defaultValue: "",
    },
    {
      name: "XPathQuery",
      type: "text",
      label: "XPath query",
      description: "The XPath expression to locate the subelement and remove its attribute",
      defaultValue: "",
    },
    {
      name: "attributeName",
      type: "text",
      label: "Attribute name",
      description: "The name of the attribute to remove",
      defaultValue: "",
    },
    
    
  ];
  
  const removeXMLElementAttributeFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["XMLDocument"], ["XPathQuery"],["attributeName"]],
    },
  
    
  ];
  
  const removeXMLElementAttribute: ActivityConfig = {
    fieldList: removeXMLElementAttributeFieldList,
    fieldCategories: removeXMLElementAttributeFieldCategories,
    fieldsToWatch: [],
  };
  
  export default removeXMLElementAttribute;
  