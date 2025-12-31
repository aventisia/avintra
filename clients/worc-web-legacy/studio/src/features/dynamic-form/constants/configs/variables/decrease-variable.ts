import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const decreaseVariableFieldList: IDynamicFieldSchema[] = [
  {
    name: "variableName",
    type: "text",
    label: "Variable name",
    description:
      "A numeric value, or a previously created variable containing one, to decrease the variable by",
    defaultValue: "",
  },
  {
    name: "decreaseBy",
    type: "text",
    label: "Decrease by",
    description:
      "A numeric value, or a previously created variable containing one, to decrease the variable by",
    defaultValue: "",
  },
];

const decreaseVariableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["variableName"], ["decreaseBy"]],
  },
];

const decreaseVariable: ActivityConfig = {
  fieldList: decreaseVariableFieldList,
  fieldCategories: decreaseVariableFieldCategories,
  fieldsToWatch: [],
};

export default decreaseVariable;
