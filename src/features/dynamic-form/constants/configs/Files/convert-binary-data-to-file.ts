import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const convertBinaryDataToFileFieldList: IDynamicFieldSchema[] = [
    {
      name: "binaryData",
      type: "text",
      label: "Binary data",
      description: "The binary data.",
      defaultValue: "",
      regOptions: {
        required: true,
      },
    },
    {
      name: "filePath",
      type: "text",
      label: "File path",
      description: "The file to write to.",
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
  
  const convertBinaryDataToFileFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["binaryData"],
        ["filePath"],
        ["ifFileExists"],
      ],
    },
  ];
  
  const convertBinaryDataToFile: ActivityConfig = {
    fieldList: convertBinaryDataToFileFieldList,
    fieldCategories: convertBinaryDataToFileFieldCategories,
    fieldsToWatch: [],
  };
  
  export default convertBinaryDataToFile;
  