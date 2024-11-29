import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const setScreenResolutionFieldList: IDynamicFieldSchema[] = [
    {
      name: "monitorNumber",
      type: "text",
      label: "Monitor number",
      description: "The number of the monitor to set the resolution of",
      defaultValue: "",
    },
    {
      name: "monitorWidth",
      type: "text",
      label: "Monitor width",
      description: "The value to set the width of the monitor",
      defaultValue: "",
    },
    {
      name: "monitorHeight",
      type: "text",
      label: "Monitor height",
      description: "The value to set the height of the monitor",
      defaultValue: "",
    },
    {
      name: "monitorBitCount",
      type: "text",
      label: "Monitor bit count",
      description: "The value to set the monitor bit count",
      defaultValue: "",
    },
    {
      name: "monitorFrequency",
      type: "text",
      label: "Monitor frequency",
      description: "The value to set the monitor frequency",
      defaultValue: "",
    },
  ];
  
  const setScreenResolutionFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["monitorNumber"],
        ["monitorWidth"],
        ["monitorHeight"],
        ["monitorBitCount"],
        ["monitorFrequency"],
      ],
    },
  ];
  
  const setScreenResolution: ActivityConfig = {
    fieldList: setScreenResolutionFieldList,
    fieldCategories: setScreenResolutionFieldCategories,
    fieldsToWatch: [],
  };
  
  export default setScreenResolution;
  