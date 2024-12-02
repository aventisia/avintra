import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const setActiveExcelWorksheetFieldList: IDynamicFieldSchema[] = [
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
      name: "activateWorksheetWith",
      type: "select",
      label: "Activate worksheet with",
      description: "Specify whether to find the worksheet by name or index",
      selectOptions: [
        { label: "Index", value: "index" },
        { label: "Name", value: "name" },
      ],
      defaultValue: "",
    },
    {
      name: "worksheetIndex",
      type: "text",
      label: "Worksheet index",
      description:
        "The index of the worksheet to activate. The numbering starts from 1",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          initialState: true,
          conditionList: [
            {
              fields: [{ key: "activateWorksheetWith", value: "index" }],
            },
          ],
        },
      },
    },
    {
      name: "worksheetName",
      type: "text",
      label: "Worksheet name",
      description: "The name of the worksheet to activate",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "activateWorksheetWith", value: "name" }],
            },
          ],
        },
      },
    },
  ];
  
  const setActiveExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["excelInstance"],
        ["activateWorksheetWith"],
        ["worksheetIndex"],
        ["worksheetName"],
      ],
    },
  ];
  
  const setActiveExcelWorksheet: ActivityConfig = {
    fieldList: setActiveExcelWorksheetFieldList,
    fieldCategories: setActiveExcelWorksheetFieldCategories,
    fieldsToWatch: ["activateWorksheetWith"],
  };
  
  export default setActiveExcelWorksheet;
  