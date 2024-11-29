import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const resumeServiceFieldList: IDynamicFieldSchema[] = [
  {
    name: "serviceToResume",
    type: "select",
    label: "Service to resume",
    description: "The name of the service to resume",
    selectOptions: [],
    defaultValue: "",
  },
];

const resumeServiceFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["serviceToResume"]],
  },
];
const resumeService: ActivityConfig = {
  fieldList: resumeServiceFieldList,
  fieldCategories: resumeServiceFieldCategories,
  fieldsToWatch: [],
};

export default resumeService;
