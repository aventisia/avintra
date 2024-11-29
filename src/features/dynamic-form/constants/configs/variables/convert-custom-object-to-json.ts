import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../..";

const convertCustomObjectToJsonFieldList: IDynamicFieldSchema[] = [
  {
    name: "customObject",
    type: "select",
    label: "Custom object",
    description: "The custom object to convert to JSON",
    selectOptions: [],
    defaultValue: "",
  },
  //output
  {
    name: "customObjectAsJson",
    type: "switch",
    label: "customObjectAsJson",
    description: "The converted JSON from the provided custom object",
    defaultValue: true,
  },
];

const convertCustomObjectToJsonFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["customObject"]],
  },
  {
    title: "Output",
    formFieldKeys: [["customObjectAsJson"]],
  },
];

const convertCustomObjectToJson: ActivityConfig = {
  fieldList: convertCustomObjectToJsonFieldList,
  fieldCategories: convertCustomObjectToJsonFieldCategories,
  fieldsToWatch: [],
};

export default convertCustomObjectToJson;
