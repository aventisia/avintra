import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";
const takeScreenshotOfWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "	Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "capture",
    type: "select",
    label: "Capture",
    description:
      "Specify whether to capture the entire web page or only a specific element of it",
    selectOptions: [
      { label: "Entire web page", value: "entire web page" },
      { label: "Specific element", value: "specific element" },
    ],
    defaultValue: "entire web page",
  },
  {
    name: "uIElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "	Select the UI element on web page to capture",
    defaultValue: "",
  },
  {
    name: "saveMode",
    type: "select",
    label: "Save mode",
    description:
      "Specify whether to save the image into a file or store it into the clipboard",
    selectOptions: [
      { label: "Clipboard", value: "clipboard" },
      { label: "File", value: "file" },
    ],
    defaultValue: "clipboard",
  },
  {
    name: "imageFile",
    type: "text",
    label: "Image file",
    description: "Set the full path for the file to save the image capture",
    defaultValue: "",
  },
  {
    name: "fileFormat",
    type: "select",
    label: "File format",
    description: "",
    selectOptions: [
      { label: "BMP", value: "bmp" },
      { label: "EMF", value: "emf" },
      { label: "EXIF", value: "exif" },
      { label: "GIF", value: "gif" },
      { label: "JPG", value: "jpg" },
      { label: "PNG", value: "png" },
      { label: "TIFF", value: "tiff" },
      { label: "WMF", value: "wmf" },
    ],
    defaultValue: "bmp",
  },
];

const takeScreenshotOfWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["capture"],
      ["uIElement"],
      ["saveMode"],
      ["imageFile"],
      ["fileFormat"],
    ],
  },
];
const takeScreenshotOfWebPage: ActivityConfig = {
  fieldList: takeScreenshotOfWebPageFieldList,
  fieldCategories: takeScreenshotOfWebPageFieldCategories,
  fieldsToWatch: [],
};

export default takeScreenshotOfWebPage;
