import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const getDetailsOfAUiElementInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The window to get details from",
    defaultValue: "",
  },
  {
    name: "attributeName",
    type: "select",
    label: "Attribute name",
    description: "The attribute whose value will be retrieved",
    selectOptions: [
      { label: "Own Text", value: "ownText" },
      { label: "Exists", value: "exists" },
      { label: "Location and Size", value: "locationAndSize" },
      { label: "Enabled", value: "enabled" },
    ],
    defaultValue: "ownText",
  },
  {
    name: "bringToFront",
    type: "switch",
    label: "Bring to front",
    description:
      "Specify whether the window containing the UI element should be brought to the front during execution. If this option is disabled, the action will be executed in the background. Note that not all UI elements may be compatible with having the option disabled. Additionally, if execution of the action requires scrolling, disabling this option may not extract all elements.",
    defaultValue: true,
  },
  //output
  {
    name: "attributeValue",
    type: "switch",
    label: "AttributeValue",
    description: "The value of the UI element's text",
    defaultValue: true,
  },
];

const getDetailsOfAUiElementInWindowFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["uiElement"], ["attributeName"], ["bringToFront"]],
    },
    {
      title: "Output",
      formFieldKeys: [["attributeValue"]],
    },
  ];
const getDetailsOfAUiElementInWindowFieldsToWatch: string[] = [];

const getDetailsOfAUiElementInWindow: ActivityConfig = {
  fieldList: getDetailsOfAUiElementInWindowFieldList,
  fieldCategories: getDetailsOfAUiElementInWindowFieldCategories,
  fieldsToWatch: getDetailsOfAUiElementInWindowFieldsToWatch,
};

export default getDetailsOfAUiElementInWindow;
