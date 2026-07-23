export const TABLE_KEY = "dynamic-data-table";

export type ColumnHeaderMap<TData> = {
  [key in keyof Partial<TData>]: {
    title: string;
    dataType?: "string" | "money" | "date";
    dateFormat?: string;
  };
};
