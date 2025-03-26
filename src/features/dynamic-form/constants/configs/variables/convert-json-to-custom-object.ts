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
    name: "o_jsonAsCustomObjectOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The new list that holds the contents of the specified data table",
    defaultValue: "JsonAsCustomObject",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_jsonAsCustomObjectSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  
  {
    name: "o_jsonAsCustomObjectSwitch", //to watch
    type: "output-switch-field",
    label: "JsonAsCustomObject",
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
    formFieldKeys: [["o_jsonAsCustomObjectOutput", "o_jsonAsCustomObjectSwitch"]],
  },
];


const convertJSONToCustomObject: ActivityConfig = {
  fieldList: convertJSONToCustomObjectFieldList,
  fieldCategories: convertJSONToCustomObjectFieldCategories,
  fieldsToWatch: ["o_jsonAsCustomObjectOutput", "o_jsonAsCustomObjectSwitch"],
};

export default convertJSONToCustomObject;
