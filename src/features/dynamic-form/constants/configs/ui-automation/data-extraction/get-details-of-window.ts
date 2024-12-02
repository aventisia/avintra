import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const getDetailsOfWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "window",
    type: "ui-element-selector",
    label: "Window",
    description: "The window to get details from",
    defaultValue: "",
  },
  {
    name: "windowPropertySelect",
    type: "select",
    label: "Window property",
    description: "Choose which property of the window to extract",
    selectOptions: [
      { label: "Get window title", value: "getWindowTitle" },
      { label: "Get window text", value: "getWindowText" },
      {
        label: "Get window location and size",
        value: "getWindowLocationAndSize",
      },
      { label: "Get process name", value: "getProcessName" },
    ],
    defaultValue: "getWindowTitle",
  },
  {
    name: "bringToFront",
    type: "switch",
    label: "Bring to front",
    description:
      "Specify whether the window containing the Ul element should be brought to the front during execution. If this option is disabled, the action will be executed in the background. Note that not all Ul elements may be compatible with having the option disabled. Additionally, if execution of the action requires scrolling, disabling this option may not extract all elements.",
    defaultValue: true,
  },
  {
    name: "windowProperty",
    type: "switch",
    label: "WindowProperty",
    description: "The retrieved information of the window",
    defaultValue: true,
  },
];

const getDetailsOfWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["window"],
      ["windowPropertySelect"],
      ["bringToFront"],
      ["windowProperty"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["windowProperty"]],
  },
];
const getDetailsOfWindowFieldsToWatch: string[] = [];

const getDetailsOfWindow: ActivityConfig = {
  fieldList: getDetailsOfWindowFieldList,
  fieldCategories: getDetailsOfWindowFieldCategories,
  fieldsToWatch: getDetailsOfWindowFieldsToWatch,
};

export default getDetailsOfWindow;
