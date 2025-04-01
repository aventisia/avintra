import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const closeWordFieldList: IDynamicFieldSchema[] = [
  {
    name: "wordInstance",
    type: "select",
    label: "Word instance",
    description:
      "The Word instance to close. This variable must have been previously specified in a Launch Word or Attach to running Word action",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "beforeClosingWord",
    type: "select",
    label: "Before closing Word",
    description:
      "Specify whether and how to save the document of this instance before closing that instance",
    selectOptions: [
      { label: "Do not save document", value: "Do not save document" },
      { label: "Save document", value: "Save document" },
      { label: "Save document as", value: "Save document as" },
    ],
    defaultValue: "Do not save document",
  },
  {
    name: "documentFormat",
    type: "select",
    label: "Document format",
    description: "The format of the document",
    selectOptions: [
      { label: "Default (From Extension)", value: "Default (From Extension)" },
      { label: "Word Document (*.docx)", value: "Word Document (*.docx)" },
      {
        label: "Word Macro-Enabled Document (*.docm)",
        value: "Word Macro-Enabled Document (*.docm)",
      },
      {
        label: "Word 97-2003 Document (*.doc)",
        value: "Word 97-2003 Document (*.doc)",
      },
      { label: "Word Template (*.dotx)", value: "Word Template (*.dotx)" },
      {
        label: "Word Macro-Enabled Template (*.dotm)",
        value: "Word Macro-Enabled Template (*.dotm)",
      },
      {
        label: "Word 97-2003 Document Template (*.dot)",
        value: "Word 97-2003 Document Template (*.dot)",
      },
      { label: "PDF (*.pdf)", value: "PDF (*.pdf)" },
      { label: "XPS Document (*.xps)", value: "XPS Document (*.xps)" },
      {
        label: "Single File Web Page (*.mhtm;*.mhtml)",
        value: "Single File Web Page (*.mhtm;*.mhtml)",
      },
      { label: "Web Page (*.htm;*.html)", value: "Web Page (*.htm;*.html)" },
      {
        label: "Web Page, Filtered (*.htm;*.html)",
        value: "Web Page, Filtered (*.htm;*.html)",
      },
      { label: "Rich Text Format (*.rtf)", value: "Rich Text Format (*.rtf)" },
      { label: "Plain Text (*.txt)", value: "Plain Text (*.txt)" },
      {
        label: "Text with line breaks (*.txt)",
        value: "Text with line breaks (*.txt)",
      },
      { label: "DOS Text (*.txt)", value: "DOS Text (*.txt)" },
      {
        label: "DOS Text with line breaks (*.txt)",
        value: "DOS Text with line breaks (*.txt)",
      },
      { label: "Unicode Text (*.txt)", value: "Unicode Text (*.txt)" },
      {
        label: "Word XML Document (*.xml)",
        value: "Word XML Document (*.xml)",
      },
      {
        label: "Strict Open XML Document (*.docx)",
        value: "Strict Open XML Document (*.docx)",
      },
      {
        label: "OpenDocument Text (*.odt)",
        value: "OpenDocument Text (*.odt)",
      },
    ],
    defaultValue: "Default (From Extension)",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "beforeClosingWord", value: "Save document as" }],
          },
        ],
      },
    },
  },
  {
    name: "documentPath",
    type: "text",
    label: "Document path",
    description:
      "The full path of the document. Insert the desired document file extension according to the selection in the Document format parameter",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "beforeClosingWord", value: "Save document as" }],
          },
        ],
      },
    },
  },
];

const closeWordFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Close Settings",
    formFieldKeys: [
      ["wordInstance"],
      ["beforeClosingWord"],
      ["documentFormat"],
      ["documentPath"],
    ],
  },
];

const closeWord: ActivityConfig = {
  fieldList: closeWordFieldList,
  fieldCategories: closeWordFieldCategories,
  fieldsToWatch: ["beforeClosingWord"],
};

export default closeWord;
