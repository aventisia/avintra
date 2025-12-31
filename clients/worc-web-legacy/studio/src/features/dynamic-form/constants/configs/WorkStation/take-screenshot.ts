import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const takeScreenshotFieldList: IDynamicFieldSchema[] = [
    {
      name: "capture",
      type: "select",
      label: "Capture",
      selectOptions: [
        { label: "All screens", value: "allScreens" },
        { label: "Primary screen", value: "primaryScreen" },
        { label: "Select screen", value: "selectScreen" },
        { label: "Foreground window", value: "foregroundWindow" },
      ],
      description: "The area to capture",
      defaultValue: "allScreens",
    },
    {
      name: "screenToCapture",
      type: "text",
      label: "Screen to capture",
      description: "Specify which screen to capture",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "capture", value: "selectScreen" }],
            },
          ],
        },
      },
    },
    {
      name: "saveScreenshotTo",
      type: "select",
      label: "Save screenshot to",
      selectOptions: [
        { label: "Clipboard", value: "clipboard" },
        { label: "File", value: "file" },
      ],
      description: "The location to save the screenshot to",
      defaultValue: "clipboard",
    },
    {
      name: "imageFile",
      type: "text",
      label: "Image file",
      description: "The full path of the file name where the captured image will be saved",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "saveScreenshotTo", value: "file" }],
            },
          ],
          initialState: false,
        },
      },
    },
    {
      name: "imageFormat",
      type: "select",
      label: "Image format",
      selectOptions: [
        { label: "BMP", value: "bmp" },
        { label: "GIF", value: "gif" },
        { label: "JPG", value: "jpg" },
        { label: "PNG", value: "png" },
        { label: "TIFF", value: "tiff" },
      ],
      description: "The format for the image file to save",
      defaultValue: "bmp",
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "saveScreenshotTo", value: "file" }],
            },
          ],
          initialState: false,
        },
      },
    },
  ];
  
  const takeScreenshotFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["capture"],
        ["screenToCapture"],
        ["saveScreenshotTo"],
        ["imageFile"],
        ["imageFormat"]
      ],
    },
  ];
  
  const takeScreenshot: ActivityConfig = {
    fieldList: takeScreenshotFieldList,
    fieldCategories: takeScreenshotFieldCategories,
    fieldsToWatch: ["capture", "saveScreenshotTo"],
  };
  
  export default takeScreenshot;
  