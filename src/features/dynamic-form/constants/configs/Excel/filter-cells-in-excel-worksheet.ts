import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const filterCellsInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
    {
      name: "excelInstance",
      type: "select",
      label: "Excel Instance",
      description:
        "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action",
      selectOptions: [],  
      defaultValue: "",
    },
    {
      name: "filterColumnIn",
      type: "select",
      label: "Filter column in",
      description:
        "Specify whether the column to be filtered is part of a table, a specified range, either by name or absolute coordinates or if it is part of the general active worksheet",
      selectOptions: [
        { label: "Active sheet", value: "Active sheet" },
        { label: "Table", value: "Table" },
        { label: "Range", value: "Range" },
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
              fields: [{ key: "filterColumnIn", value: "Table" }],
            },
          ],
        },
      },
      defaultValue: "",
    },
    {
      name: "range",
      type: "select",
      label: "Range",
      description:
        "Specify the range to be filtered either using named cell or absolute column/index",
      selectOptions: [
        { label: "Named cells", value: "Named cells" },
        { label: "Specific range", value: "Specific range" },
      ],
      defaultValue: "Named cells",
    },
    {
      name: "cellsName",
      type: "text",
      label: "Cells name",
      description: "Name representing the range",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "range", value: "Named cells" }],
            },
          ],
        },
      },
      defaultValue: "",
    },
    {
      name: "startColumn",
      type: "text",
      label: "Start column",
      description: "The index or letter of the first column",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "range", value: "Specific range" }],
            },
          ],
        },
      },
      defaultValue: "",
    },
    {
      name: "startRow",
      type: "text",
      label: "Start row",
      description: "The first row number.",
      defaultValue: "",
    },
    {
      name: "endColumn",
      type: "text",
      label: "End column",
      description: "The index or letter of the last column",
      defaultValue: "",
    },
    {
      name: "endRow",
      type: "text",
      label: "End row",
      description: "The last row number.",
      defaultValue: "",
    },
    {
      name: "ColumnToFilter",
      type: "text",
      label: "Column to filter",
      description:
        "Name or index of the column to be filtered. If the column is part of a table use the header name.",
      defaultValue: "",
    },
    {
      name: "filtersToApply",
      type: "text",
      label: "Filters to apply",
      description: "Filtering rules applied to the defined column",
      defaultValue: "",
    },
  ];
  
  const filterCellsInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["excelInstance"],
        ["filterColumnIn"],
        ["tableName"],
        ["range"],
        ["cellsName"],
        ["startColumn"],
        ["startRow"],
        ["endColumn"],
        ["endRow"],
        ["ColumnToFilter"],
        ["filtersToApply"],
      ],
    },
  ];
  
  const filterCellsInExcelWorksheet: ActivityConfig = {
    fieldList: filterCellsInExcelWorksheetFieldList,
    fieldCategories: filterCellsInExcelWorksheetFieldCategories,
    fieldsToWatch: ["filterColumnIn", "range"],
  };
  
  export default filterCellsInExcelWorksheet;
  