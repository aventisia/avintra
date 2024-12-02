import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const waitFieldList: IDynamicFieldSchema[] = [
  {
    name: "duration",
    type: "text",
    label: "Duration",
    description: "Time duration in seconds",
    defaultValue: "",
  },
];

const waitFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["duration"]],
  },
];
const waitFieldsToWatch: string[] = [];

const wait: ActivityConfig = {
  fieldList: waitFieldList,
  fieldCategories: waitFieldCategories,
  fieldsToWatch: waitFieldsToWatch,
};

export default wait;
