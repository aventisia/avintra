import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const stopServiceFieldList: IDynamicFieldSchema[] = [
  {
    name: "serviceToStop",
    type: "text",
    label: "Service to stop",
    description: "The name of the service to stop",
    defaultValue: "",
  },
];

const stopServiceFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["serviceToStop"]],
  },
];
const stopService: ActivityConfig = {
  fieldList: stopServiceFieldList,
  fieldCategories: stopServiceFieldCategories,
  fieldsToWatch: [],
};

export default stopService;
