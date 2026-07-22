import { type ColumnSort } from "@tanstack/react-table";

type DataTablePreferencesType = {
  tableKey: string;
  sortState: ColumnSort[];
  columnVisibility: { [key: string]: boolean };
};

/**
 * Retrieves the data table preferences for a specified table key from localStorage.
 *
 * The preferences include the sort state and column visibility for the data table.
 * If no preferences are found for the given table key, default values are returned.
 *
 * @param tableKey - The unique key identifying the data table.
 * @returns An object containing:
 *   - `sortState`: An array of sort state objects for the table.
 *   - `columnVisibility`: An object mapping column keys to their visibility status.
 */
export function getDataTablePreferences(
  tableKey: string,
  defaultColumnVisibility: { [key: string]: boolean },
): {
  sortState: ColumnSort[];
  columnVisibility: { [key: string]: boolean };
} {
  // Retrieve data table preferences from localStorage
  const dtPreferencesRaw = localStorage.getItem("dataTablePreferences");

  // No data table preferences found
  if (!dtPreferencesRaw) return { sortState: [], columnVisibility: defaultColumnVisibility };

  // Parse the raw preferences
  const dtPreferences: DataTablePreferencesType[] = JSON.parse(dtPreferencesRaw);

  // dtPreferences is not an array or length is 0
  if (!Array.isArray(dtPreferences) || dtPreferences.length === 0)
    return { sortState: [], columnVisibility: defaultColumnVisibility };

  // Find preferences for the specified tableKey
  const specifiedDTPreferences = dtPreferences.find((pref) => pref.tableKey === tableKey);

  // If no preferences found for the specified tableKey, return defaults
  if (!specifiedDTPreferences) return { sortState: [], columnVisibility: defaultColumnVisibility };

  // Merge default column visibility with stored preferences
  specifiedDTPreferences.columnVisibility = {
    ...defaultColumnVisibility,
    ...specifiedDTPreferences.columnVisibility,
  };

  // Update localStorage with merged column visibility
  const dtPreferencesIndex = dtPreferences.findIndex((dt) => dt.tableKey === tableKey);
  if (dtPreferencesIndex > -1) {
    dtPreferences[dtPreferencesIndex] = specifiedDTPreferences;
    localStorage.setItem("dataTablePreferences", JSON.stringify(dtPreferences));
  }

  // Return the sort state and column visibility
  return {
    sortState: Array.isArray(specifiedDTPreferences.sortState)
      ? specifiedDTPreferences.sortState
      : [],
    columnVisibility: specifiedDTPreferences.columnVisibility,
  };
}

/**
 * Updates or sets preferences for a data table, such as sorting state and column visibility, in localStorage.
 *
 * If preferences for the specified `tableKey` already exist, they are updated; otherwise, a new entry is created.
 * Only provided preferences (`sortState` and/or `columnVisibility`) are updated.
 *
 * @param tableKey - A unique key identifying the data table.
 * @param sortState - Optional. An array representing the sorting state of table columns.
 * @param columnVisibility - Optional. An object mapping column keys to their visibility state.
 *
 * @remarks
 * - If neither `sortState` nor `columnVisibility` is provided, the function does nothing.
 * - Preferences are stored under the "dataTablePreferences" key in localStorage.
 */
export function setDataTablePreferences(
  tableKey: string,
  sortState?: ColumnSort[],
  columnVisibility?: { [key: string]: boolean },
) {
  // If no tableKey provided, do nothing
  if (!tableKey) return;

  // If no sortState or columnVisibility provided, do nothing
  if (!sortState && !columnVisibility) return;

  // Retrieve existing preferences from localStorage
  const dtPreferencesRaw = localStorage.getItem("dataTablePreferences");

  // Parse existing preferences or initialize an empty array
  const dtPreferences: DataTablePreferencesType[] = dtPreferencesRaw
    ? JSON.parse(dtPreferencesRaw)
    : [
        {
          tableKey,
          sortState: [],
          columnVisibility: {},
        },
      ];

  // Find index of existing preferences for the specified tableKey
  const dtIndex = dtPreferences.findIndex((dt) => dt.tableKey === tableKey);

  // If column visibility object provided then merge it with existing visibility state
  if (columnVisibility && dtIndex > -1) {
    columnVisibility = {
      ...dtPreferences[dtIndex].columnVisibility,
      ...columnVisibility,
    };
  }

  // Create new preferences object
  const newDT: DataTablePreferencesType = {
    tableKey,
    sortState: sortState ? sortState : dtPreferences[dtIndex]?.sortState || [],
    columnVisibility: columnVisibility
      ? columnVisibility
      : dtPreferences[dtIndex]?.columnVisibility || {},
  };

  // Update existing preferences or add new entry
  if (dtIndex > -1) {
    dtPreferences[dtIndex] = newDT;
  } else {
    dtPreferences.push(newDT);
  }

  // Save updated preferences back to localStorage
  localStorage.setItem("dataTablePreferences", JSON.stringify(dtPreferences));
}
