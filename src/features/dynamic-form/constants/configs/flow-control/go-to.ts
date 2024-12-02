import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const goToFieldList: IDynamicFieldSchema[] = [
  {
    name: "goToLabel",
    type: "select",
    label: "Got to label",
    description: "Label in the flow",
    selectOptions: [], //dynamic options
    defaultValue: "",
  },
];

const goToFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["goToLabel"]],
  },
];
const goToFieldsToWatch: string[] = [];

const goTo: ActivityConfig = {
  fieldList: goToFieldList,
  fieldCategories: goToFieldCategories,
  fieldsToWatch: goToFieldsToWatch,
};

export default goTo;
