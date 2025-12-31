import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const escapeTextForRegularExpressionFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToEscape",
    type: "text",
    label: "Text to escape",
    description: "The text to escape",
    defaultValue: "",
  },
  //   output
  {
    name: "o_escapedTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The escaped text",
    defaultValue: "EscapedText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_escapedTextSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_escapedTextSwitch",
    type: "output-switch-field",
    label: "EscapedText",
    defaultValue: true,
  },
];

const escapeTextForRegularExpressionFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [["textToEscape"]],
    },
    {
      title: "Output",
      formFieldKeys: [["o_escapedTextOutput", "o_escapedTextSwitch"]],
    },
  ];
const escapeTextForRegularExpressionFieldsToWatch: string[] = ["o_escapedTextOutput", "o_escapedTextSwitch"];

const escapeTextForRegularExpression: ActivityConfig = {
  fieldList: escapeTextForRegularExpressionFieldList,
  fieldCategories: escapeTextForRegularExpressionFieldCategories,
  fieldsToWatch: escapeTextForRegularExpressionFieldsToWatch,
};

export default escapeTextForRegularExpression;
