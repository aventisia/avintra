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
  {
    name: "monitorWidth",
    type: "switch",
    label: "MonitorWidth",
    description: "The width of the monitor",
    defaultValue: "",
  },
  {
    name: "monitorHeight",
    type: "switch",
    label: "MonitorHeight",
    description: "The height of the monitor",
    defaultValue: "",
  },
  {
    name: "monitorBitCount",
    type: "switch",
    label: "MonitorBitCount",
    description: "The monitor bit count",
    defaultValue: "",
  },
  {
    name: "monitorFrequency",
    type: "switch",
    label: "MonitorFrequency",
    description: "The monitor frequency",
    defaultValue: "",
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
      ["monitorWidth"],
      ["monitorHeight"],
      ["monitorBitCount"],
      ["monitorFrequency"],
    ],
  },
];

const getScreenResolution: ActivityConfig = {
  fieldList: getScreenResolutionFieldList,
  fieldCategories: getScreenResolutionFieldCategories,
  fieldsToWatch: [],
};

export default getScreenResolution;
