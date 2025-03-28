import {
    ActivityConfig,
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
  } from "../../../types/dynamic-form-types";
  
  const createDataTableFieldList: IDynamicFieldSchema[] = [
    {
        name: "dataTable",
        type: "text",
        label: "Data table",
        description:
          "The input data table",
        defaultValue: "",
        placeholder: "0 Rows, 0 columns"
    },

    //output
    {
        name: "o_dataTableOutput", //to watch
        type: "output-text-field",
        label: "",
        description: "The new Data Table",
        defaultValue: "DataTable",
        regOptions: {
        disabledBasedOnFields: {
            conditionList: [
            {
                fields: [{ key: "o_dataTableSwitch", value: false }],
            },
            ],
            initialState: true,
        },
        },
    },
    {
        name: "o_dataTableSwitch", //to watch
        type: "output-switch-field",
        label: "DataTable",
        defaultValue: true,
    },

  ];
  
  const createDataTableFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["dataTable"]],
    },
    {
        title: "Output",
        formFieldKeys: [["o_dataTableOutput", "o_dataTableSwitch"]],
      },
  ];
  const createDataTableFieldsToWatch: string[] = ["o_dataTableOutput", "o_dataTableSwitch"];
  
  const createDataTable: ActivityConfig = {
    fieldList: createDataTableFieldList,
    fieldCategories: createDataTableFieldCategories,
    fieldsToWatch: createDataTableFieldsToWatch,
  };
  
  export default createDataTable;
  