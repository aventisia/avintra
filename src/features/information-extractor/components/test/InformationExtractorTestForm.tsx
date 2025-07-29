import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import DataFields from "./fields";
import ExtractedTablesData from "./tables";

interface InformationExtractorTestFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>>;
}

const InformationExtractorTestForm = ({
  form,
}: InformationExtractorTestFormProps) => {
  const { control } = form;
  const { fields: dataFields } = useFieldArray({
    control,
    name: "extraction.fields",
  });

  const { fields: tableFields, update } = useFieldArray({
    control,
    name: "extraction.tables",
  });

  // Function to add a new row to a specific table
  const handleAddRow = (tableIndex: number, rowIndex: number) => {
    // Get the table data to modify
    const updatedTable = [...tableFields];
    const tableData = updatedTable[tableIndex];

    // Loop through each column and insert a new value at the rowIndex position
    const newData = tableData.headers.map((column) => {
      // Insert the empty value at rowIndex + 1 (just after the current row)
      const newValues = [
        ...column.values.slice(0, rowIndex + 1),
        "",
        ...column.values.slice(rowIndex + 1),
      ];
      return {
        ...column,
        values: newValues,
      };
    });

    // Update the extractedData for the specific table
    updatedTable[tableIndex] = { ...tableData, headers: newData };

    // Apply the update
    update(tableIndex, updatedTable[tableIndex]);
  };

  const handleDeleteRow = (tableIndex: number, rowIndex: number) => {
    // Clone current table fields
    const updatedTable = [...tableFields];
    const tableData = updatedTable[tableIndex];

    // Remove the row at rowIndex from all columns
    const newData = tableData.headers.map((column) => {
      const newValues = [
        ...column.values.slice(0, rowIndex),
        ...column.values.slice(rowIndex + 1),
      ];
      return {
        ...column,
        values: newValues,
      };
    });

    // Update the specific table with new data
    updatedTable[tableIndex] = { ...tableData, headers: newData };

    // Apply the update
    update(tableIndex, updatedTable[tableIndex]);
  };

  return (
    <div className="space-y-10 px-4 pb-1">
      <DataFields form={form} dataFields={dataFields} />
      {tableFields.length > 0 && (
        <ExtractedTablesData
          form={form}
          handleAddRow={handleAddRow}
          handleDeleteRow={handleDeleteRow}
          tableFields={tableFields}
        />
      )}
    </div>
  );
};

export default InformationExtractorTestForm;
