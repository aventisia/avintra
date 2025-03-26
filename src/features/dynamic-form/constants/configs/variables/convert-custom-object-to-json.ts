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
    name: "o_customObjectAsJsonOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The converted JSON from the provided custom object",
    defaultValue: "customObjectAsJson",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_customObjectAsJsonSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_customObjectAsJsonSwitch",
    type: "output-switch-field",
    label: "customObjectAsJson",
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
    formFieldKeys: [["o_customObjectAsJsonOutput", "o_customObjectAsJsonSwitch"]],
  },
];

const convertCustomObjectToJson: ActivityConfig = {
  fieldList: convertCustomObjectToJsonFieldList,
  fieldCategories: convertCustomObjectToJsonFieldCategories,
  fieldsToWatch: ["o_customObjectAsJsonOutput", "o_customObjectAsJsonSwitch"],
};

export default convertCustomObjectToJson;
