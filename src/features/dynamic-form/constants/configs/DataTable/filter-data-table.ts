import {
    ActivityConfig,
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
  } from "../../../types/dynamic-form-types";
  
  const filterDataTableFieldList: IDynamicFieldSchema[] = [
    {
        name: "filteredDataTable",
        type: "text",
        label: "Data table",
        description:
          "The data table variable to work with. This variable must have been previously specificed by an action that produces a data table variable",
        defaultValue: "",
    },
    {
        name: "filtersToApply",
        type: "text",
        label: "Filters to apply",
        description:
          "Filtering rules applied to the defined columns.",
        defaultValue: "",
    },

    //output
    {
        name: "o_filterDataTableOutput", //to watch
        type: "output-text-field",
        label: "",
        description: "The generated data table after applying the filters",
        defaultValue: "FilteredDataTable",
        regOptions: {
        disabledBasedOnFields: {
            conditionList: [
            {
                fields: [{ key: "o_filterDataTableSwitch", value: false }],
            },
            ],
            initialState: false,
        },
        },
    },
    {
        name: "o_filterDataTableSwitch", //to watch
        type: "output-switch-field",
        label: "FilteredDataTable",
        defaultValue: true,
    },

  ];
  
  const filterDataTableFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["filteredDataTable"], ["filtersToApply"]],
    },
    {
        title: "Output",
        formFieldKeys: [["o_filterDataTableOutput", "o_filterDataTableSwitch"]],
      },
  ];
  const filterDataTableFieldsToWatch: string[] = ["o_filterDataTableOutput", "o_filterDataTableSwitch"];
  
  const filterDataTable: ActivityConfig = {
    fieldList: filterDataTableFieldList,
    fieldCategories: filterDataTableFieldCategories,
    fieldsToWatch: filterDataTableFieldsToWatch,
  };
  
  export default filterDataTable;
  