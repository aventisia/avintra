import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const getLastErrorFieldList: IDynamicFieldSchema[] = [
  {
    name: "storeInto",
    type: "text",
    label: "Store into",
    description: "Store into",
    defaultValue: "",
  },
  {
    name: "clearError",
    type: "switch",
    label: "Clear error",
    description:
      "After the error is stored in the variable, it's cleared so that next time the error is retrieved, it won't retrieve the same error value.",
    defaultValue: false,
  },
];

const getLastErrorFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["storeInto"], ["clearError"]],
  },
];
const getLastErrorFieldsToWatch: string[] = [];

const getLastError: ActivityConfig = {
  fieldList: getLastErrorFieldList,
  fieldCategories: getLastErrorFieldCategories,
  fieldsToWatch: getLastErrorFieldsToWatch,
};

export default getLastError;
