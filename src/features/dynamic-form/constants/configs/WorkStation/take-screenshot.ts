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
      defaultValue: "Clipboard",
    },
  ];
  
  const takeScreenshotFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["capture"],
        ["screenToCapture"],
        ["saveScreenshotTo"],
      ],
    },
  ];
  
  const takeScreenshot: ActivityConfig = {
    fieldList: takeScreenshotFieldList,
    fieldCategories: takeScreenshotFieldCategories,
    fieldsToWatch: ["capture"],
  };
  
  export default takeScreenshot;
  