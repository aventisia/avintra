import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const useDesktopFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The Ul element to perform click on",
    defaultValue: "",
  },
  {
    name: "clickType",
    type: "select",
    label: "Click type",
    description: "The kind of click to perform",
    selectOptions: [
      { label: "Left click", value: "leftClick" },
      { label: "Right click", value: "rightClick" },
      { label: "Double click", value: "doubleClick" },
    ],
    defaultValue: "leftClick",
  },
  {
    name: "launchNewApp",
    type: "switch",
    label: "Launch new application when left-clicking on the taskbar",
    description:
      "When this parameter is set to 'true', it ensures that a new window of an application will be created when left-clicking on its icon in the 'quick launch' bar, aka the taskbar of Windows 7 or above. Uncheck this option to bring an already running instance of the application to the foreground.",
    defaultValue: true,
  },
];

const useDesktopFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["uiElement"], ["clickType"], ["launchNewApp"]],
  },
];
const useDesktopFieldsToWatch: string[] = [];

const useDesktop: ActivityConfig = {
  fieldList: useDesktopFieldList,
  fieldCategories: useDesktopFieldCategories,
  fieldsToWatch: useDesktopFieldsToWatch,
};

export default useDesktop;
