import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const pauseServicesFieldList: IDynamicFieldSchema[] = [
  {
    name: "serviceToPause",
    type: "text",
    label: "Service to pause",
    description: "The name of the service to pause",
    defaultValue: "",
  },
];

const pauseServicesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["serviceToPause"]],
  },
];
const pauseService: ActivityConfig = {
  fieldList: pauseServicesFieldList,
  fieldCategories: pauseServicesFieldCategories,
  fieldsToWatch: [],
};

export default pauseService;
