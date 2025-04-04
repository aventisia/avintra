import {
    ActivityConfig,
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
  } from "../../..";
  
const runDesktopFlowFieldList: IDynamicFieldSchema[] = [
    {
        name: "desktopFlow", // to watch
        type: "flow-select-combobox",
        label: "Desktop Flow",
        placeholder: "Select a Desktop Flow",
        selectOptions: [],
        description: "Select the desktop flow to run from from within its flow. The called flow always runs in the sam  window session as the parent flow.",
        defaultValue: "",
        regOptions: {
        required: true,
        },
    },
    {
        name: "waitForFlowtoComplete",
        type: "switch",
        label: "Wait for flow to complete",
        description: "If enabled, this desktop flow waits for the invoked desktop flow to complete, before resuming its run. The invoked desktop flow's output variables become normally available to current flow. If disbaled, the invoked desktop flow run concurrently. Its output variables are ignored in this case",
        defaultValue: true,
    },
   
  ];
  
  const runDesktopFlowFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["desktopFlow"], ["waitForFlowtoComplete"]],
    },
  ];
  
  const truncateNumber: ActivityConfig = {
    fieldList: runDesktopFlowFieldList,
    fieldCategories: runDesktopFlowFieldCategories,
    fieldsToWatch: ["operation"],
  };
  
  export default truncateNumber;
  