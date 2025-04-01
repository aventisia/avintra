import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const writeToWordDocumentFieldList: IDynamicFieldSchema[] = [
    {
      name: "wordInstance",
      type: "select",
      label: "Word Instance",
      description:
        "The Word instance to work with. This variable must have been previously specified in a Launch Word or Attach to running Word action",
      selectOptions: [], 
      defaultValue: "",
    },
    {
      name: "textToWrite",
      type: "textarea",
      label: "Text to write",
      description: "The text to write in the specified Word document",
      defaultValue: "",
    },
    {
      name: "appendNewLine",
      type: "switch",
      label: "Append new line",
      description:
        "Specifies whether to append a new line at the start of the overall text to write to the document",
      defaultValue: false,
    },
    {
      name: "writeTextTo",
      type: "select",
      label: "Write text to",
      description:
        "Specifies the position of the Word document that text will be appended",
      selectOptions: [
        { label: "Beginning of the Word file", value: "Beginning of the Word file" },
        { label: "End of the Word file", value: "End of the Word file" },
        { label: "Before Bookmark", value: "Before Bookmark" },
        { label: "After Bookmark", value: "After Bookmark" },
      ],
      defaultValue: "End of the Word file",
    },
    {
      name: "bookmark",
      type: "text",
      label: "Bookmark",
      description:
        "The target bookmark in the Word document where the text will be appended. This action appends text before or after the specified bookmark in the Word document",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [
                { key: "writeTextTo", value: "Before Bookmark" },
                { key: "writeTextTo", value: "After Bookmark" },
              ],
              logicalOperator:"OR"
            },
          ],
          initialState: false,
        },
      },
    },
  ];
  
  const writeToWordDocumentFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Text Insertion Settings",
      formFieldKeys: [
        ["wordInstance"],
        ["textToWrite"],
        ["appendNewLine"],
        ["writeTextTo"],
        ["bookmark"],
      ],
    },
  ];
  
  const writeToWordDocument: ActivityConfig = {
    fieldList: writeToWordDocumentFieldList,
    fieldCategories: writeToWordDocumentFieldCategories,
    fieldsToWatch: ["writeTextTo"],
  };
  
  export default writeToWordDocument;
  