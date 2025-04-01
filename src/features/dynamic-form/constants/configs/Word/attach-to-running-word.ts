import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const attachToRunningWordFieldList: IDynamicFieldSchema[] = [
  {
    name: "documentName",
    type: "select",
    label: "Document name",
    description: "The name or path of the Word document to attach to",
    selectOptions: [],
    defaultValue: "",
  },
  // Output
  {
    name: "o_wordInstanceOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
    "The Word instance this action has attached to for use with later Word actions",
    defaultValue: "WordInstance",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_wordInstanceSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_wordInstanceSwitch",
    type: "output-switch-field",
    label: "WordInstance",
    defaultValue: true,
  },
];

const attachToRunningWordFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["documentName"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_wordInstanceOutput", "o_wordInstanceSwitch"]],
  },
];

const attachToRunningWord: ActivityConfig = {
  fieldList: attachToRunningWordFieldList,
  fieldCategories: attachToRunningWordFieldCategories,
  fieldsToWatch: ["o_wordInstanceOutput", "o_wordInstanceSwitch"],
};

export default attachToRunningWord;
