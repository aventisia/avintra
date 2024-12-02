import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const pingFieldList: IDynamicFieldSchema[] = [
    {
      name: "hostName",
      type: "text",
      label: "Host name",
      description: "The name of the remote computer or an IP address",
      defaultValue: "",
      regOptions: {
        required: true,
      },
    },
    {
      name: "timeout",
      type: "text",
      label: "Timeout",
      description:
        "The maximum number of milliseconds to wait for the Ping reply message",
      defaultValue: "",
    },
    // output 
    {
      name: "pingResult",
      type: "switch",
      label: "PingResult",
      description: "The status of the ping message (success or failure)",
      defaultValue: "",
    },
    {
      name: "roundTripTime",
      type: "switch",
      label: "RoundTripTime",
      description: "The number of milliseconds taken for the Ping to complete",
      defaultValue: "",
    },
  ];
  
  const pingFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["hostName"],
        ["timeout"],
      ],
    },
    {
      title: "Output",
      formFieldKeys: [
        ["pingResult"],
        ["roundTripTime"],
      ],
    },
  ];
  
  const ping: ActivityConfig = {
    fieldList: pingFieldList,
    fieldCategories: pingFieldCategories,
    fieldsToWatch: [],
  };
  
  export default ping;
  