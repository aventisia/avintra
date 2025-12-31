import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const increaseVariableFieldList: IDynamicFieldSchema[] = [
  {
    name: "variableName",
    type: "text",
    label: "Variable name",
    description: "The numeric value to increase",
    defaultValue: "",
  },
  {
    name: "increaseBy",
    type: "text",
    label: "Increase by",
    description:
      "A numeric value, or a previously created variable containing one, to increase the variable by",
    defaultValue: "",
  },
];

const increaseVariableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["variableName"], ["increaseBy"]],
  },
];


const increaseVariable: ActivityConfig = {
  fieldList: increaseVariableFieldList,
  fieldCategories: increaseVariableFieldCategories,
  fieldsToWatch: [],
};

export default increaseVariable;
