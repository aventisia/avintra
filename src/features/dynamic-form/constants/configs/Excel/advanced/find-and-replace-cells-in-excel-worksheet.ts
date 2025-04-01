import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../../..";

const findsAndReplaceCellsInExcelWorksheetFieldList: IDynamicFieldSchema[] = [
  {
    name: "excelInstance",
    type: "select",
    label: "Excel instance",
    description:
      "The Excel instance to work with. This variable must have been previously specified in a Launch Excel action.",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "searchMode",
    type: "select",
    label: "Search mode",
    description: "The mode to search with",
    selectOptions: [
      { label: "Find", value: "find" },
      { label: "Find and replace", value: "find and replace" },
    ],
    defaultValue: "find",
  },
  {
    name: "allMatches",
    type: "switch",
    label: "All matches",
    description:
      "Whether to find/replace text in all the matching cells found or in the first matching cell only",
    defaultValue: false,
  },
  {
    name: "textToFind",
    type: "text",
    label: "Text to find",
    description: "	The text to find in the worksheet",
    defaultValue: "",
  },
  {
    name: "textToReplaceWith",
    type: "text",
    label: "Text to replace with",
    description: "	The text used to replace the matching cells",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [
              { key: "searchMode", value: "find and replace" },

            ],
          },
        ],
      },
    },
  },
  {
    name: "matchCase",
    type: "switch",
    label: "Match case",
    description: "Whether to search for case-sensitive data",
    defaultValue: false,
  },
  {
    name: "matchEntireCellContents",
    type: "switch",
    label: "Match entire cell contents",
    description:
      "Whether to search for cells that contain just the specified text",
    defaultValue: false,
  },
  {
    name: "searchBy",
    type: "select",
    label: "Search by",
    description: "",
    selectOptions: [
      { label: "Rows", value: "rows" },
      { label: "Columns", value: "columns" },
    ],
    defaultValue: "rows",
  },
  // output
  {
    name: "o_foundColumnIndexOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The index of the column found",
    defaultValue: "FoundColumnIndex",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_foundColumnIndexSwitch", value: false }],
          },
        ],
        initialState: true,
      },
      requiredBasedOnFields:{
        conditionList: [
          {
            fields: [
              {key : "allMatches", value: false}
            ]
          }
        ],
        initialState: true,
      }
    },
  },
  {
    name: "o_foundColumnIndexSwitch",
    type: "output-switch-field",
    label: "FoundColumnIndex",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields:{
        conditionList: [
          {
            fields: [
              {key : "allMatches", value: false}
            ]
          }
        ],
        initialState: true,
      }
    },
  },

  {
    name: "o_foundRowIndexOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The index of the row found",
    defaultValue: "FoundRowIndex",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_foundRowIndexSwitch", value: false }],
          },
        ],
        initialState: true,
      },
      requiredBasedOnFields:{
        conditionList: [
          {
            fields: [
              {key : "allMatches", value: false}
            ]
          }
        ],
        initialState: true,
      }
    },
  },
  {
    name: "o_foundRowIndexSwitch",
    type: "output-switch-field",
    label: "FoundRowIndex",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields:{
        conditionList: [
          {
            fields: [
              {key : "allMatches", value: false}
            ]
          }
        ],
        initialState: true,
      },
    },
  },

  {
    name: "o_cellsOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The list of cells matching the criteria",
    defaultValue: "Cells",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_cellsSwitch", value: false }],
          },
        ],
        initialState: true,
      },
      requiredBasedOnFields:{
        conditionList: [
          {
            fields: [
              {key : "allMatches", value: true}
            ]
          }
        ],
        initialState: true,
      }
    },
  },
  {
    name: "o_cellsSwitch",
    type: "output-switch-field",
    label: "Cells",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields:{
        conditionList: [
          {
            fields: [
              {key : "allMatches", value: true}
            ]
          }
        ],
        initialState: true,
      },
    },
  },
];

const findsAndReplaceCellsInExcelWorksheetFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["excelInstance"],
        ["searchMode"],
        ["allMatches"],
        ["textToFind"],
        ["textToReplaceWith"],
        ["matchCase"],
        ["matchEntireCellContents"],
        ["searchBy"],
      ],
    },
    {
      title: "Output",
      formFieldKeys: [
        ["o_foundColumnIndexOutput", "o_foundColumnIndexSwitch"], 
        ["o_foundRowIndexOutput", "o_foundRowIndexSwitch"], 
        ["o_cellsOutput", "o_cellsSwitch"]
      ],
    },
  ];

const findsAndReplaceCellsInExcelWorksheet: ActivityConfig = {
  fieldList: findsAndReplaceCellsInExcelWorksheetFieldList,
  fieldCategories: findsAndReplaceCellsInExcelWorksheetFieldCategories,
  fieldsToWatch: ["searchMode","allMatches", "o_foundColumnIndexOutput", "o_foundColumnIndexSwitch", "o_foundRowIndexOutput", "o_foundRowIndexSwitch", "o_cellsOutput", "o_cellsSwitch"],
};

export default findsAndReplaceCellsInExcelWorksheet;
