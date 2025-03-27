import {
    ActivityConfig,
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
  } from "../../../types/dynamic-form-types";
  
  const joinDataTableFieldList: IDynamicFieldSchema[] = [
    {
      name: "dataTable1",
      type: "text",
      label: "First Data table",
      description:
        "The first data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
      defaultValue: "",
      regOptions: {
        required: true,
      },
    },
    {
        name: "dataTable2",
        type: "text",
        label: "Second Data table",
        description:
          "The first data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
        defaultValue: "",
        regOptions: {
            required: true,
          },
    },
    {
        name: "joinOperation",
        type: "select",
        label: "Join operation",
        selectOptions: [
          {label: "Inner", value: "inner"},
          {label: "Left", value:"left"},
          {label: "Full", value: "full"}
        ],
        description:
        "The join operation that will be used to join the two tables",
        defaultValue: "inner",
    },
    {
        name: "joinRules",
        type: "text",
        label: "Join rules",
        description:
          "Define the column and operations to be used for joining the two data tables.",
        defaultValue: "",
    },

    //output
  {
    name: "o_joinTablesOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The generated data table after the join operation",
    defaultValue: "JoinedDataTable",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_joinTablesSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_joinTablesSwitch", //to watch
    type: "output-switch-field",
    label: "JoinTables",
    defaultValue: true,
  },
  ];
  
  const joinDataTableFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["dataTable1"], ["dataTable2"], ["joinOperation"], ["joinRules"]],
    },
    {
        title: "Output",
        formFieldKeys: [["o_joinTablesOutput", "o_joinTablesSwitch"]],
      },
  ];
  const joinDataTableFieldsToWatch: string[] = ["o_joinTablesOutput", "o_joinTablesSwitch"];
  
  const joinDataTables: ActivityConfig = {
    fieldList: joinDataTableFieldList,
    fieldCategories: joinDataTableFieldCategories,
    fieldsToWatch: joinDataTableFieldsToWatch,
  };
  
  export default joinDataTables;
  