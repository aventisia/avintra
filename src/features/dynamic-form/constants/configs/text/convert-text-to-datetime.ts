import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const convertTextToDatetimeFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToConvert",
    type: "text",
    label: "Text to convert",
    description:
      "The text to convert to a datetime value. This text must be in a recognizably datetime value format",
    defaultValue: "",
  },
  {
    name: "dateInCustomFormat", // to watch
    type: "switch",
    label: "Date is represented in custom format",
    description:
      "Specify whether the text to convert contains a representation of the date and time in a non-standard, non-recognizable format",
    defaultValue: false,
  },
  {
    name: "customFormat",
    type: "text",
    label: "Custom format",
    description:
      "The format in which the date is stored in the text. A custom format can be expressed as, for example, yyyyMMdd for date and hhmmss for time",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "dateInCustomFormat", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  //   output
  {
    name: "o_textAsDateTimeOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The datetime value",
    defaultValue: "TextAsDateTime",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_textAsDateTimeSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_textAsDateTimeSwitch",
    type: "output-switch-field",
    label: "TextAsDateTime",
    defaultValue: true,
  },
];

const convertTextToDatetimeFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["textToConvert"],
      ["dateInCustomFormat"],
      ["customFormat"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_textAsDateTimeOutput", "o_textAsDateTimeSwitch"]],
  },
];

const convertTextToDatetime: ActivityConfig = {
  fieldList: convertTextToDatetimeFieldList,
  fieldCategories: convertTextToDatetimeFieldCategories,
  fieldsToWatch: ["dateInCustomFormat","o_textAsDateTimeOutput", "o_textAsDateTimeSwitch"],
};

export default convertTextToDatetime;
