import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const setVariableFieldList: IDynamicFieldSchema[] = [
  {
    name: "variable",
    type: "text",
    label: "Variable",
    description: "New variable",
    defaultValue: "NewVar",
  },
  {
    name: "value",
    type: "textarea",
    label: "Value",
    description: "The value to assign to the variable",
    defaultValue: "",
  },
];

const setVariableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["variable"], ["value"]],
  },
];


const setVariable: ActivityConfig = {
  fieldList: setVariableFieldList,
  fieldCategories: setVariableFieldCategories,
  fieldsToWatch: [],
};

export default setVariable;
