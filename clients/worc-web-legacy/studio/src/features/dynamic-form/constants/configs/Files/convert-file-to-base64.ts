import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const convertFileToBase64FieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The file to read from.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  // output 
  {
    name: "o_base64TextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The Base64 encoded text.",
    defaultValue: "Base64Text",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_base64TextSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_base64TextSwitch",
    type: "output-switch-field",
    label: "Base64Text",
    defaultValue: true,
  },
];

const convertFileToBase64FieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Input",
    formFieldKeys: [["filePath"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_base64TextOutput", "o_base64TextSwitch"]],
  },
];

const convertFileToBase64: ActivityConfig = {
  fieldList: convertFileToBase64FieldList,
  fieldCategories: convertFileToBase64FieldCategories,
  fieldsToWatch: ["o_base64TextOutput", "o_base64TextSwitch"],
};

export default convertFileToBase64;
