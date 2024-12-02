import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const terminateProcessFieldList: IDynamicFieldSchema[] = [
    {
      name: "specifyProcessBy",
      type: "select",
      label: "Specify process by",
      selectOptions: [
        { label: "Process ID", value: "processId" },
        { label: "Process Name", value: "processName" },
      ],
      description:
        "Specify whether the process to terminate will be specified by its name, or by its ID",
      defaultValue: "Process ID",
    },
    {
      name: "processId",
      type: "text",
      label: "Process ID",
      description: "The id of the process to terminate",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "specifyProcessBy", value: "processId" }],
            },
          ],
        },
      },
    },
    {
      name: "processName",
      type: "select",
      label: "Process name",
      selectOptions: [
        { label: "AggregatorHost", value: "AggregatorHost" },
        { label: "AppHelperCap", value: "AppHelperCap" },
        { label: "ApplicationFrameHost", value: "ApplicationFrameHost" },
        { label: "AppVShNotify", value: "AppVShNotify" },
        { label: "backgroundTaskHost", value: "backgroundTaskHost" },
        { label: "browserHost", value: "browserHost" },
        { label: "chrome", value: "chrome" },
        { label: "cmd", value: "cmd" },
        { label: "conHost", value: "conHost" },
        { label: "CrossDeviceService", value: "CrossDeviceService" },
        { label: "csrss", value: "csrss" },
        { label: "ctfmon", value: "ctfmon" },
        { label: "dasHost", value: "dasHost" },
        { label: "DiagsCap", value: "DiagsCap" },
        { label: "dllhost", value: "dllhost" },
        { label: "dwm", value: "dwm" },
        { label: "EMAILSCN", value: "EMAILSCN" },
        { label: "EMON", value: "EMON" },
        { label: "esif_uf", value: "esif_uf" },
        { label: "ETDCtrl", value: "ETDCtrl" },
        { label: "ETDService", value: "ETDService" },
        { label: "explorer", value: "explorer" },
        { label: "expressvpnd", value: "expressvpnd" },
        { label: "fontdrvhost", value: "fontdrvhost" },
        { label: "gamingServices", value: "gamingServices" },
        { label: "gamingservicesnet", value: "gamingservicesnet" },
        { label: "HPAudioSwitch", value: "HPAudioSwitch" },
      ],
      description:
        "The name of the process to terminate. If more than one processes with the same name are running, all of them will be terminated",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "specifyProcessBy", value: "processName" }],
            },
          ],
        },
      },
    },
  ];
  
  const terminateProcessFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["specifyProcessBy"],
        ["processId"],
        ["processName"],
      ],
    },
  ];
  
  const terminateProcess: ActivityConfig = {
    fieldList: terminateProcessFieldList,
    fieldCategories: terminateProcessFieldCategories,
    fieldsToWatch: ["specifyProcessBy","processId","processName"],
  };
  
  export default terminateProcess;
  