import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getDetailsOfElementOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "select",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "select",
    label: "UI element",
    description: "	Select the UI element on web page to capture",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "attributeName",
    type: "text",
    label: "Attribute name",
    description: "Enter or select the attribute whose value to retrieve",
    defaultValue: "Own Text",
  },
  // output
  {
    name: "attributeValue",
    type: "switch",
    label: "AttributeValue",
    description: "The value of the web element's attribute",
    defaultValue: true,
  },
];

const getDetailsOfElementOnWebPageFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["webBrowserInstance"], ["uIElement"], ["attributeName"]],
    },
    {
      title: "Object",
      formFieldKeys: [["attributeValue"]],
    },
  ];

const getDetailsOfElementOnWebPage: ActivityConfig = {
  fieldList: getDetailsOfElementOnWebPageFieldList,
  fieldCategories: getDetailsOfElementOnWebPageFieldCategories,
  fieldsToWatch: [],
};

export default getDetailsOfElementOnWebPage;
