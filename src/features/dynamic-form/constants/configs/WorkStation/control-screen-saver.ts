import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const controlScreensaverFieldList: IDynamicFieldSchema[] = [
    {
      name: "screenSaverAction",
      type: "select",
      label: "Screen saver action",
      selectOptions: [
        { label: "Enable", value: "enable" },
        { label: "Disable", value: "disable" },
        { label: "Start", value: "start" },
        { label: "Stop", value: "stop" },
      ],
      description: "The function of the screensaver",
      defaultValue: "Enable",
    },
  ];
  
  const controlScreensaverFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["screenSaverAction"],
      ],
    },
  ];
  
  const controlScreensaver: ActivityConfig = {
    fieldList: controlScreensaverFieldList,
    fieldCategories: controlScreensaverFieldCategories,
    fieldsToWatch: [],
  };
  
  export default controlScreensaver;
  