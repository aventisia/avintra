import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const convertFileToBinaryDataFieldList: IDynamicFieldSchema[] = [
    {
      name: "filePath",
      type: "text",
      label: "File path",
      description: "The file to read from.",
      defaultValue: "",
      regOptions: {
        required: true,
      },
    },
    // output 
    {
      name: "o_binaryDataOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The binary data to write.",
      defaultValue: "binaryData",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_binaryDataSwitch", value: false }],
            },
          ],
          initialState: false,
        },
      },
    },
    {
      name: "o_binaryDataSwitch",
      type: "output-switch-field",
      label: "binaryData",
      defaultValue: true,
    },
  ];
  
  const convertFileToBinaryDataFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["filePath"]],
    },
    {
      title: "Output",
      formFieldKeys: [["o_binaryDataOutput", "o_binaryDataSwitch"]],
    },
  ];
  
  const convertFileToBinaryData: ActivityConfig = {
    fieldList: convertFileToBinaryDataFieldList,
    fieldCategories: convertFileToBinaryDataFieldCategories,
    fieldsToWatch: ["o_binaryDataOutput", "o_binaryDataSwitch"],
  };
  
  export default convertFileToBinaryData;
  