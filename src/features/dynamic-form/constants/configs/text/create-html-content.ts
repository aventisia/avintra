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
    name: "htmlContent",
    type: "switch",
    label: "HtmlContent",
    description: "The html code",
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
    formFieldKeys: [["htmlContent"]],
  },
];
const createHtmlContentFieldsToWatch: string[] = ["editor"];

const createHtmlContent: ActivityConfig = {
  fieldList: createHtmlContentFieldList,
  fieldCategories: createHtmlContentFieldCategories,
  fieldsToWatch: createHtmlContentFieldsToWatch,
};

export default createHtmlContent;
