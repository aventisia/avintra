import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const createHtmlContentFieldList: IDynamicFieldSchema[] = [
  {
    name: "editor",
    type: "switch",
    label: "HTML editor",
    description: "Editor",
    defaultValue: false,
  },
  {
    name: "textEditor",
    type: "textarea", //To Do: to be replace text editor
    label: "Text editor",
    description: "Text editor",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "editor", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "htmlEditor",
    type: "textarea", //To Do: to be replace code editor
    label: "HTML editor",
    description: "HTML editor",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "editor", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  //   output
  {
    name: "o_htmlContentOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The html code",
    defaultValue: "HtmlContent",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_htmlContentSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_htmlContentSwitch", //to watch
    type: "output-switch-field",
    label: "HtmlContent",
    defaultValue: true,
  },
];

const createHtmlContentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["editor"], ["textEditor"], ["htmlEditor"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_htmlContentOutput", "o_htmlContentSwitch"]],
  },
];
const createHtmlContentFieldsToWatch: string[] = ["editor", "o_htmlContentOutput", "o_htmlContentSwitch"];

const createHtmlContent: ActivityConfig = {
  fieldList: createHtmlContentFieldList,
  fieldCategories: createHtmlContentFieldCategories,
  fieldsToWatch: createHtmlContentFieldsToWatch,
};

export default createHtmlContent;
