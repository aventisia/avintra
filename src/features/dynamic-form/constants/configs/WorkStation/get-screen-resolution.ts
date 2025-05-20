import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getScreenResolutionFieldList: IDynamicFieldSchema[] = [
  {
    name: "monitorNumber",
    type: "text",
    label: "Monitor number",
    description: "The number of the monitor to get the resolution of",
    defaultValue: "",
  },
  // Output
  {
    name: "o_monitorWidthOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The width of the monitor",
    defaultValue: "MonitorWidth",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_monitorWidthSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_monitorWidthSwitch",
    type: "output-switch-field",
    label: "MonitorWidth",
    defaultValue: true,
  },

  {
    name: "o_monitorHeightOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The height of the monitor",
    defaultValue: "MonitorHeight",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_monitorHeightSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_monitorHeightSwitch",
    type: "output-switch-field",
    label: "MonitorHeight",
    defaultValue: true,
  },

  {
    name: "o_monitorBitCountOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The monitor bit count",
    defaultValue: "MonitorBitCount",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_monitorBitCountSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_monitorBitCountSwitch",
    type: "output-switch-field",
    label: "MonitorBitCount",
    defaultValue: true,
  },

  {
    name: "o_monitorFrequencyOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The monitor frequency",
    defaultValue: "MonitorFrequency",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_monitorFrequencySwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_monitorFrequencySwitch",
    type: "output-switch-field",
    label: "MonitorFrequency",
    defaultValue: true,
  },
];

const getScreenResolutionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["monitorNumber"]],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["o_monitorWidthOutput", "o_monitorWidthSwitch"],
      ["o_monitorHeightOutput", "o_monitorHeightSwitch"],
      ["o_monitorBitCountOutput", "o_monitorBitCountSwitch"],
      ["o_monitorFrequencyOutput", "o_monitorFrequencySwitch"],
    ],
  },
];

const getScreenResolution: ActivityConfig = {
  fieldList: getScreenResolutionFieldList,
  fieldCategories: getScreenResolutionFieldCategories,
  fieldsToWatch: ["o_monitorWidthOutput", "o_monitorWidthSwitch", "o_monitorHeightOutput", "o_monitorHeightSwitch", "o_monitorBitCountOutput", "o_monitorBitCountSwitch", "o_monitorFrequencyOutput", "o_monitorFrequencySwitch"],
};

export default getScreenResolution;
