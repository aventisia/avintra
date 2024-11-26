import { NodeDataType } from "@/types/node-data-type";

export const dataTableActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "createNewDataTable",
    label: "Create new data table",
    description: "Creates a new data table variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "insertRowIntoDataTable",
    label: "Insert row into data table",
    description: "Inserts a row at the end or before a specific index value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteRowFromDataTable",
    label: "Delete row from data table",
    description: "Delete a data table row at the corresponding row index",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "updateDataTableItem",
    label: "Update data table item",
    description: "Update a data table row item on a defined column",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "findOrReplaceInDataTable",
    label: "Find or replace in data table",
    description: "Finds and/or replaces data table values",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "insertColumnIntoDataTable",
    label: "Insert column into data table",
    description: "Inserts a column at the end or before a specific index value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteColumnFromDataTable",
    label: "Delete column from data table",
    description:
      "Delete a data table column at the specified column index or column name",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteEmptyRowsFromDataTable",
    label: "Delete empty rows from data table",
    description:
      "Deletes the rows of the data table that have all of their cells empty",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteDuplicateRowsFromDataTable",
    label: "Delete duplicate rows from data table",
    description:
      "Deletes all the rows that are duplicate from the data table, if the values have the same data type in each column",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "clearDataTable",
    label: "Clear data table",
    description:
      "Deletes all the rows of the data table, keeping table headers unaffected",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "sortDataTable",
    label: "Sort data table",
    description:
      "Sorts the data table rows in ascending or descending order by the specified column, if all its values have the same data type",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "filterDataTable",
    label: "Filter data table",
    description: "Filters the data table rows based on the applied rules",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "mergeDataTables",
    label: "Merge data tables",
    description:
      "Merges two data tables together, specifying the merging behavior in case their number of columns is different",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "joinDataTables",
    label: "Join data tables",
    description: "Joins two data tables based on the specified join rule",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "readFromCsvTextVariable",
    label: "Read from CSV text variable",
    description: "Generates a data table from a CSV text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertDataTableToText",
    label: "Convert data table to text",
    description: "Converts a data table to a CSV text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
