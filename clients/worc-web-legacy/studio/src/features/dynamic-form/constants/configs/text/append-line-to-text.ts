import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const appendLineToTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "originalText",
    type: "text",
    label: "Original text",
    description: "The original text",
    defaultValue: "",
  },
  {
    name: "lineToAppend",
    type: "text",
    label: "Line to append",
    description: "The text to add on as a new line",
    defaultValue: "",
  },
  //   output
    //output
    {
      name: "o_resultOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The new text",
      defaultValue: "Result",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_resultSwitch", value: false }],
            },
          ],
          initialState: false,
        },
      },
    },
  {
    name: "o_resultSwitch",
    type: "output-switch-field",
    label: "Result",
    defaultValue: true,
  },
];

const appendLineToTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["originalText"], ["lineToAppend"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_resultOutput", "o_resultSwitch"]],
  },
];

const appendLineToText: ActivityConfig = {
  fieldList: appendLineToTextFieldList,
  fieldCategories: appendLineToTextFieldCategories,
  fieldsToWatch: ["o_resultOutput", "o_resultSwitch"],
};

export default appendLineToText;
