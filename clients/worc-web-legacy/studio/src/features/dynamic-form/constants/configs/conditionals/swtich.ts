import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const switchCaseFieldList: IDynamicFieldSchema[] = [
  {
    name: "valueToCheck",
    type: "text",
    label: "Value to Check",
    description:
      "Enter a value name, text, or number to compare with the following cases",
    defaultValue: "",
  },
];

const switchCaseFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["valueToCheck"]],
  },
];

const switchCaseFieldsToWatch: string[] = ["operator"];

const switchCase: ActivityConfig = {
  fieldList: switchCaseFieldList,
  fieldCategories: switchCaseFieldCategories,
  fieldsToWatch: switchCaseFieldsToWatch,
};

export default switchCase;
