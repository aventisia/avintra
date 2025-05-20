import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const clearFiltersInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
    {
      name: "excelInstance",
      type: "text",
      label: "Excel Instance",
      description:
        "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
      defaultValue: "",
    },
    {
      name: "clearFiltersIn",
      type: "select",
      label: "Clear filters in",
      description:
        "Specify whether to clear filters from the entire active worksheet or from a specific table",
      selectOptions: [
        { label: "Active sheet", value: "Active sheet" },
        { label: "Table", value: "Table" },
      ],
      defaultValue: "Active sheet",
    },
    {
      name: "tableName",
      type: "text",
      label: "Table name",
      description: "The name of the table",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "clearFiltersIn", value: "Table" }],
            },
          ],
        },
      },
      defaultValue: "",
    },
    {
      name: "clearFiltersFormSpecificColumn",
      type: "switch",
      label: "Clear filters form specific column",
      description: "Clear filters from a specific column",
      defaultValue: false,
    },
    {
      name: "clearFilterInColumn",
      type: "text",
      label: "Clear filter in column",
      description: "The column name to clear applied filter",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "clearFiltersFormSpecificColumn", value: true }],
            },
          ],
        },
      },
      defaultValue: "",
    },
  ];
  
  const clearFiltersInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["excelInstance"],
        ["clearFiltersIn"],
        ["tableName"],
        ["clearFiltersFormSpecificColumn"],
        ["clearFilterInColumn"],
      ],
    },
  ];
  
  const clearFiltersInExcelWorksheet: ActivityConfig = {
    fieldList: clearFiltersInExcelWorksheetFieldList,
    fieldCategories: clearFiltersInExcelWorksheetFieldCategories,
    fieldsToWatch: ["clearFiltersIn", "clearFiltersFormSpecificColumn"],
  };
  
  export default clearFiltersInExcelWorksheet;