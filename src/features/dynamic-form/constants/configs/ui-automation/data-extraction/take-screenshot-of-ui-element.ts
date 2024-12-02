import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const takeScreenshotOfUiElementFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The Ul element in the window to capture as screenshot",
    defaultValue: "",
  },
  {
    name: "saveMode", // to watch
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
    name: "imageFilePath",
    type: "text",
    label: "imageFilePath",
    description: "Set the full path for the file to be saved",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "saveMode", value: "file" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "fileFormat",
    type: "select",
    label: "imageFilePath",
    description: "The file format of the image file",
    selectOptions: [
      { label: "BMP", value: "BMP" },
      { label: "GIF", value: "GIF" },
      { label: "JPG", value: "JPG" },
      { label: "PNG", value: "PNG" },
      { label: "TIFF", value: "TIFF" },
    ],
    defaultValue: "BMP",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "saveMode", value: "file" }],
          },
        ],
        initialState: false,
      },
    },
  },
  //output
  {
    name: "imageFile",
    type: "switch",
    label: "ImageFile",
    description: "The file path of the generated screenshot image file",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "saveMode", value: "file" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const takeScreenshotOfUiElementFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["uiElement"],
      ["saveMode"],
      ["imageFilePath"],
      ["fileFormat"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["imageFile"]],
  },
];
const takeScreenshotOfUiElementFieldsToWatch: string[] = ["saveMode"];

const takeScreenshotOfUiElement: ActivityConfig = {
  fieldList: takeScreenshotOfUiElementFieldList,
  fieldCategories: takeScreenshotOfUiElementFieldCategories,
  fieldsToWatch: takeScreenshotOfUiElementFieldsToWatch,
};

export default takeScreenshotOfUiElement;
