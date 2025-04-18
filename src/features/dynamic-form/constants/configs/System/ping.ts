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
      name: "o_pingResultOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The status of the ping message (success or failure)",
      defaultValue: "PingResult",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_pingResultSwitch", value: false }],
            },
          ],
          initialState: true,
        },
      },
    },
    {
      name: "o_pingResultSwitch",
      type: "output-switch-field",
      label: "PingResult",
      defaultValue: true,
    },

    {
      name: "o_roundTripTimeOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The number of milliseconds taken for the Ping to complete",
      defaultValue: "RoundTripTime",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_roundTripTimeSwitch", value: false }],
            },
          ],
          initialState: true,
        },
      },
    },
    {
      name: "o_roundTripTimeSwitch",
      type: "output-switch-field",
      label: "RoundTripTime",
      defaultValue: true,
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
        ["o_pingResultOutput", "o_pingResultSwitch"],
        ["o_roundTripTimeOutput", "o_roundTripTimeSwitch"],
      ],
    },
  ];
  
  const ping: ActivityConfig = {
    fieldList: pingFieldList,
    fieldCategories: pingFieldCategories,
    fieldsToWatch: ["o_pingResultOutput", "o_pingResultSwitch", "o_roundTripTimeOutput", "o_roundTripTimeSwitch"],
  };
  
  export default ping;
  