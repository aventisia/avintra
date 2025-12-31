import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const setXMLElementValueFieldList: IDynamicFieldSchema[] = [
    {
      name: "XMLDocument",
      type: "select",
      label: "XML document",
      selectOptions: [  
      ],
      description: "The XML document or XML element to retrieve it value",
      defaultValue: "",
    },
    {
      name: "XPathQuery",
      type: "text",
      label: "XPath query",
      description: "The XPath expression to locate the subelement and retrieve its value",
      defaultValue: "",
    },
    {
      name: "XMLElementValue",
      type: "text",
      label: "XML element value",
      description: "The new value for the XML element",
      defaultValue: "",
    },
    
    
  ];
  
  const setXMLElementValueFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["XMLDocument"], ["XPathQuery"],["XMLElementValue"]],
    },
  
    
  ];
  
  const setXMLElementValue: ActivityConfig = {
    fieldList: setXMLElementValueFieldList,
    fieldCategories: setXMLElementValueFieldCategories,
    fieldsToWatch: [],
  };
  
  export default setXMLElementValue;
  