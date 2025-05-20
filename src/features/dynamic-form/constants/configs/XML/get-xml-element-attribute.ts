import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const getXmlElementAttributeFieldList: IDynamicFieldSchema[] = [
    {
      name: "XMLDocument",
      type: "select",
      label: "XML document",
      selectOptions:[],
      description: "The XML document or XML element to retrieve its attribute",
      defaultValue: "",
    },
    {
      name: "XPathQuery",
      type: "text",
      label: "XPath query",
      description: "The XPath expression to locate the subelement and retrieve its attribute",
      defaultValue: "",
    },
    {
      name: "attributeName",
      type: "text",
      label: "Attribute name",
      description: "The name of the attribute to retrieve its value",
      defaultValue: "",
    },
    {
        name: "getValueAs",
        type: "select",
        label: "Get value as",
        description: "Specifies the data type for the attribute value",
        selectOptions: [
            { label: "Text value", value: "Text value" },
            { label: "Numeric value", value: "Numeric value" },
            { label: "Datetime value", value: "Datetime value" },
            { label: "Boolean value", value: "Boolean value" },
          ],
        defaultValue:"Text value",
      }
      // {
      //   name: "XmlAttributeValue",
      //   type: "text",
      //   label: "XmlAttributeValue",
      //   description: "The retrieved value of the XML attribute",
      //   defaultValue: false,
      // },
      // {
      //   name: "XmlAttributeValue",
      //   type: "date",
      //   label: "XmlAttributeValue",
      //   description: "The retrieved value of the XML attribute",
      //   defaultValue: false,
      // },{
      //   name: "XmlAttributeValue",
      //   type: "number",
      //   label: "XmlAttributeValue",
      //   description: "The retrieved value of the XML attribute",
      //   defaultValue: false,
      // }
      ,
      {
        name: "o_XmlAttributeValueOutput", //to watch
        type: "output-text-field",
        label: "",
        description: "The retrieved value of the XML attribute",
        defaultValue: "XmlAttributeValue",
        regOptions: {
          disabledBasedOnFields: {
            conditionList: [
              {
                fields: [{ key: "o_XmlAttributeValueSwitch", value: false }],
              },
            ],
            initialState: false,
          },
        },
      },
      {
        name: "o_XmlAttributeValueSwitch",
        type: "output-switch-field",
        label: "XmlAttributeValue",
        defaultValue: true,
      },
  ];
  
  const getXmlElementAttributeFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["XMLDocument"], ["XPathQuery"],["attributeName"],["getValueAs"]],
    },
  
    {
      title: "Output",
      formFieldKeys: [["o_XmlAttributeValueOutput", "o_XmlAttributeValueSwitch"]],
    },
  ];
  
  const getXmlElementAttribute: ActivityConfig = {
    fieldList: getXmlElementAttributeFieldList,
    fieldCategories: getXmlElementAttributeFieldCategories,
    fieldsToWatch: ["o_XmlAttributeValueOutput", "o_XmlAttributeValueSwitch"],
  };
  
  export default getXmlElementAttribute;
  