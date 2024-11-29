import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const insertXMLElementFieldList: IDynamicFieldSchema[] = [
    {
      name: "XMLDocument",
      type: "select",
      label: "XML document",
      selectOptions: [  
      ],
      description: "The XML document to insert the new XML element",
      defaultValue: "",
    },
    {
      name: "XPathQuery",
      type: "text",
      label: "XPath query",
      description: "The XPath expression to locate the parent XML element and insert the new element into it",
      defaultValue: "",
    },
    {
      name: "XMLElementToInsert",
      type: "textarea",
      label: "XML element to insert",
      description: "The new XML element to insert into the XML document",
      defaultValue: "",
    },
    
    
  ];
  
  const insertXMLElementFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["XMLDocument"], ["XPathQuery"],["XMLElementToInsert"]],
    },
  
    
  ];
  
  const insertXMLElement: ActivityConfig = {
    fieldList: insertXMLElementFieldList,
    fieldCategories: insertXMLElementFieldCategories,
    fieldsToWatch: [],
  };
  
  export default insertXMLElement;
  