import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const getDetailsOfWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "get",
    type: "select",
    label: "Get",
    description: "",
    selectOptions: [
      { label: "Web page description", value: "web page description" },
      { label: "Web page meta keywords", value: "web page meta keywords" },
      { label: "Web page title", value: "web page title" },
      { label: "Web page text", value: "web page text" },
      { label: "Web page source", value: "web page source" },
      {
        label: "Web browser's current URL address",
        value: "web browser's current URL address",
      },
    ],
    defaultValue: "web page description",
  },
  // output
  {
    name: "o_webPagePropertyOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The details retrieved from the web page",
    defaultValue: "WebPageProperty",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_webPagePropertySwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_webPagePropertySwitch",
    type: "output-switch-field",
    label: "WebPageProperty",
    defaultValue: true,
  },
];

const getDetailsOfWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["webBrowserInstance"], ["get"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_webPagePropertyOutput", "o_webPagePropertySwitch"]],
  },
];

const getDetailsOfWebPage: ActivityConfig = {
  fieldList: getDetailsOfWebPageFieldList,
  fieldCategories: getDetailsOfWebPageFieldCategories,
  fieldsToWatch: ["o_webPagePropertyOutput", "o_webPagePropertySwitch"],
};

export default getDetailsOfWebPage;
