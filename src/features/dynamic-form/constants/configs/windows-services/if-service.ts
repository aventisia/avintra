import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const ifServiceFieldList: IDynamicFieldSchema[] = [
  {
    name: "ifService",
    type: "select",
    label: "If service",
    description: "The state of the service to check",
    selectOptions: [
      { label: "Is stopped", value: "is stopped" },
      { label: "Is installed", value: "is installed" },
      { label: "Isn't installed", value: "isn't installed" },
      { label: "Is running", value: "is running" },
      { label: "Is paused", value: "is paused" },
    ],
    defaultValue: "is running",
  },
  // in this below input In UI it is display  as select but in More Info it showing Text Value there are no select options
  {
    name: "serviceName",
    type: "text",
    label: "Service name",
    description: "The name of the service to check",
    defaultValue: "",
  },
];

const ifServiceFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["ifService"], ["serviceName"]],
  },
];
const ifService: ActivityConfig = {
  fieldList: ifServiceFieldList,
  fieldCategories: ifServiceFieldCategories,
  fieldsToWatch: [],
};

export default ifService;
