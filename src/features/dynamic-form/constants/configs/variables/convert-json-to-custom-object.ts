import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const convertJSONToCustomObjectFieldList: IDynamicFieldSchema[] = [
  {
    name: "jsonData",
    type: "textarea",
    label: "JSON",
    description:
      "A JSON text, or a previously created variable containing one, to convert it to a custom object",
    defaultValue: "",
  },
  //output
  {
    name: "jsonAsCustomObject",
    type: "switch",
    label: "JsonAsCustomObject",
    description:
      "The new list that holds the contents of the specified data table",
    defaultValue: true,
  },
];

const convertJSONToCustomObjectFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["jsonData"]],
  },
  {
    title: "Output",
    formFieldKeys: [["jsonAsCustomObject"]],
  },
];

const convertJSONToCustomObjectFieldsToWatch: string[] = [];

const convertJSONToCustomObject: ActivityConfig = {
  fieldList: convertJSONToCustomObjectFieldList,
  fieldCategories: convertJSONToCustomObjectFieldCategories,
  fieldsToWatch: convertJSONToCustomObjectFieldsToWatch,
};

export default convertJSONToCustomObject;
