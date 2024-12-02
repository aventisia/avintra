import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const convertBase64ToTextFieldList: IDynamicFieldSchema[] = [
    {
      name: "base64EncodedText",
      type: "text",
      label: "Base64 encoded text",
      description: "The Base64 encoded text.",
      defaultValue: "",
      regOptions: {
        required: true,
      },
    },
    {
      name: "filePath",
      type: "text",
      label: "File path",
      description: "The file to write.",
      defaultValue: "",
      regOptions: {
        required: true,
      },
    },
    {
      name: "ifFileExists",
      type: "select",
      label: "If file exists",
      description: "Specifies what to do if a file with the same name already exists in the destination folder.",
      selectOptions: [
        { label: "Do nothing", value: "doNothing" },
        { label: "Overwrite", value: "overwrite" },
      ],
      defaultValue: "doNothing",
    },
  ];
  
  const convertBase64ToTextFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["base64EncodedText"],
        ["filePath"],
        ["ifFileExists"],
      ],
    },
  ];
  
  const convertBase64ToText: ActivityConfig = {
    fieldList: convertBase64ToTextFieldList,
    fieldCategories: convertBase64ToTextFieldCategories,
    fieldsToWatch: [],
  };
  
  export default convertBase64ToText;
  