import { NodeDataType } from "@/types/node-data-type";

export const excelActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "resizeColumnsRowsInExcelWorksheet",
    label: "Resize columns/rows in Excel worksheet",
    description:
      "Resizes a selection of columns or rows in the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runExcelMacro",
    label: "Run Excel macro",
    description: "Runs a specified macro on the document of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getActiveExcelWorksheet",
    label: "Get active Excel worksheet",
    description: "Retrieves an Excel document's active worksheet.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getAllExcelWorksheets",
    label: "Get all Excel worksheets",
    description: "Retrieves all worksheet names of an Excel document.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteExcelWorksheet",
    label: "Delete Excel worksheet",
    description: "Deletes a specific worksheet from an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "renameExcelWorksheet",
    label: "Rename Excel worksheet",
    description: "Renames a specific worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "copyExcelWorksheet",
    label: "Copy Excel worksheet",
    description:
      "Copies a worksheet from an Excel document and paste it to the Excel document of the same or different Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "activateCellInExcelWorksheet",
    label: "Activate cell in Excel worksheet",
    description:
      "Activate a cell in the active worksheet of an Excel instance, by providing column, row, and offset.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "selectCellsInExcelWorksheet",
    label: "Select cells in Excel worksheet",
    description:
      "Selects a range of cells in the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getSelectedCellRangeFromExcelWorksheet",
    label: "Get selected cell range from Excel worksheet",
    description:
      "Retrieve the selected range of cells in a structure consisting of first column, first row, last column, and last row.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "copyCellsFromExcelWorksheet",
    label: "Copy cells from Excel worksheet",
    description:
      "Copies a range of cells from the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "pasteCellsToExcelWorksheet",
    label: "Paste cells to Excel worksheet",
    description:
      "Pastes a range of cells to the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteFromExcelWorksheet",
    label: "Delete from Excel worksheet",
    description:
      "Deletes a cell or a range of cells from the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "insertRowToExcelWorksheet",
    label: "Insert row to Excel worksheet",
    description: "Inserts a row above a selected row of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteRowFromExcelWorksheet",
    label: "Delete row from Excel worksheet",
    description: "Deletes a selected row from an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "insertColumnToExcelWorksheet",
    label: "Insert column to Excel worksheet",
    description:
      "Inserts a column to the left of a selected column of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteColumnFromExcelWorksheet",
    label: "Delete column from Excel worksheet",
    description: "Deletes a selected column from an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "findAndReplaceCellsInExcelWorksheet",
    label: "Find and replace cells in Excel worksheet",
    description:
      "Finds text and replaces it with another in the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getFirstFreeRowOnColumnFromExcelWorksheet",
    label: "Get first free row on column from Excel worksheet",
    description:
      "Retrieve the first free row, given the column of the active worksheet.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "readFormulaFromExcel",
    label: "Read formula from Excel",
    description: "Reads the formula inside a cell in Excel.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getTableRangeFromExcelWorksheet",
    label: "Get table range from Excel worksheet",
    description:
      "Retrieves the range of a table in the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "autoFillCellsInExcelWorksheet",
    label: "Auto fill cells in Excel worksheet",
    description:
      "Auto fills a range with data, based on the data of another range, in the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "appendCellsInExcelWorksheet",
    label: "Append cells in Excel worksheet",
    description:
      "Appends a range of cells to the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "lookupRangeInExcelWorksheet",
    label: "Lookup range in Excel worksheet",
    description: "Finds and returns the result of Excel's LOOKUP function.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setColorOfCellsInExcelWorksheet",
    label: "Set color of cells in Excel worksheet",
    description:
      "Fills the background of the selected cells with the specified color, in the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "launchExcel",
    label: "Launch Excel",
    description: "Launches a new Excel instance or opens an Excel document.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "attachToRunningExcel",
    label: "Attach to running Excel",
    description: "Attaches to an Excel document that's already open.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "readFromExcelWorksheet",
    label: "Read from Excel worksheet",
    description:
      "Reads the value of a cell or a range of cells from the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getActiveCellOnExcelWorksheet",
    label: "Get active cell on Excel worksheet",
    description:
      "Get the active cell in the active worksheet of the Excel document.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "saveExcel",
    label: "Save Excel",
    description: "Saves a previously launched Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "writeToExcelWorksheet",
    label: "Write to Excel worksheet",
    description:
      "Writes a value into a cell or a range of cells of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "closeExcel",
    label: "Close Excel",
    description: "Closes an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setActiveExcelWorksheet",
    label: "Set active Excel worksheet",
    description: "Activates a specific worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "addNewWorksheet",
    label: "Add new worksheet",
    description: "Adds a new worksheet to the document of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getFirstFreeColumnRowFromExcelWorksheet",
    label: "Get first free column/row from Excel worksheet",
    description:
      "Retrieves the first free column and/or row of the active worksheet. This is useful for adding new data into a worksheet that already has data in it.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getColumnNameOnExcelWorksheet",
    label: "Get column name on Excel worksheet",
    description: "Gets the name of the column.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "clearCellsInExcelWorksheet",
    label: "Clear cells in Excel worksheet",
    description:
      "Clears a range of cells or a named cell in the active worksheet of an Excel instance.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "filterCellsInExcelWorksheet",
    label: "Filter cells in Excel worksheet",
    description:
      "Filter cells in Excel worksheet allows makers to create and apply a filter in the active sheet, table, or range on the values of a specified column. To filter multiple columns in an active sheet/table/range, multiple Filter cells in Excel worksheet actions must be used, each one applying the respective filter.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
