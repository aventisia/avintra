import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const findAndReplaceWordsInWordDocumentFieldList: IDynamicFieldSchema[] = [
  {
    name: "wordInstance",
    type: "text",
    label: "Word Instance",
    description:
      "The Word instance to work with. This variable must have been previously specified in a Launch Word or Attach to running Word action",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "allMatches",
    type: "switch",
    label: "All matches",
    description:
      "Whether to find and replace text in all the matching occurrences found or in the first matching occurrence only",
    defaultValue: false,
  },
  {
    name: "textToFind",
    type: "text",
    label: "Text to find",
    description: "The text to find in the document",
    defaultValue: "",
  },
  {
    name: "textToReplaceWith",
    type: "text",
    label: "Text to replace with",
    description: "The text used to replace the matching text",
    defaultValue: "",
  },
  {
    name: "useWildcards",
    type: "switch",
    label: "Use wildcards",
    description: "Whether to use wildcards for the text to find",
    defaultValue: false,
  },
  {
    name: "matchCase",
    type: "switch",
    label: "Match case",
    description: "Whether to search for case-sensitive data",
    defaultValue: false,
    regOptions: {
        requiredBasedOnFields: {
          initialState: true,
          conditionList: [
            {
              fields: [{ key: "useWildcards", value: false }],
            },
          ],
        },
        
      },
  },
  {
    name: "matchWholeWordsOnly",
    type: "switch",
    label: "Match whole words only",
    description:
      "Whether to search for words that are the same as the specified text",
    defaultValue: false,
    regOptions: {
        requiredBasedOnFields: {
          initialState: true,
          conditionList: [
            {
              fields: [{ key: "useWildcards", value: false }],
            },
          ],
        },
        
      },
  },
];

const findAndReplaceWordsInWordDocumentFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["wordInstance"],
        ["allMatches"],
        ["textToFind"],
        ["textToReplaceWith"],
        ["useWildcards"],
        ["matchCase"],
        ["matchWholeWordsOnly"],
      ],
    },
  ];

const findAndReplaceWordsInWordDocument: ActivityConfig = {
  fieldList: findAndReplaceWordsInWordDocumentFieldList,
  fieldCategories: findAndReplaceWordsInWordDocumentFieldCategories,
  fieldsToWatch: ["useWildcards"],
};

export default findAndReplaceWordsInWordDocument;
