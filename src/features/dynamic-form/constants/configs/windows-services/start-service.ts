import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const startServiceFieldList: IDynamicFieldSchema[] = [
  {
    name: "serviceToStart",
    type: "select",
    label: "Service to start",
    description: "The name of the service to start",
    selectOptions: [],
    defaultValue: "",
  },
];

const startServiceFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["serviceToStart"]],
  },
];
const startService: ActivityConfig = {
  fieldList: startServiceFieldList,
  fieldCategories: startServiceFieldCategories,
  fieldsToWatch: [],
};

export default startService;
