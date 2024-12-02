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
    name: "escapedText",
    type: "switch",
    label: "EscapedText",
    description: "The escaped text",
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
      formFieldKeys: [["escapedText"]],
    },
  ];
const escapeTextForRegularExpressionFieldsToWatch: string[] = [];

const escapeTextForRegularExpression: ActivityConfig = {
  fieldList: escapeTextForRegularExpressionFieldList,
  fieldCategories: escapeTextForRegularExpressionFieldCategories,
  fieldsToWatch: escapeTextForRegularExpressionFieldsToWatch,
};

export default escapeTextForRegularExpression;
