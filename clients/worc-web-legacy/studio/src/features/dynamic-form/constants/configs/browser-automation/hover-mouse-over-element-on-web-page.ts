import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const hoverMouseOverElementOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "Select the text field to populate",
    defaultValue: "",
  },
  {
    name: "moveMouseToHover",
    type: "switch",
    label: "Move mouse to hover",
    description:
      "Specify whether to physically move the mouse cursor over the element in order to hover the UI element. A physical hover is required for cases where emulated hover doesn't perform the intentional action on the element. As this option requires the browser window to be focused, it automatically brings it to the foreground.",
    defaultValue: false,
  },
];

const hoverMouseOverElementOnWebPageFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["webBrowserInstance"],
        ["uIElement"],
        ["moveMouseToHover"],
      ],
    },
  ];

const hoverMouseOverElementOnWebPage: ActivityConfig = {
  fieldList: hoverMouseOverElementOnWebPageFieldList,
  fieldCategories: hoverMouseOverElementOnWebPageFieldCategories,
  fieldsToWatch: [],
};

export default hoverMouseOverElementOnWebPage;
