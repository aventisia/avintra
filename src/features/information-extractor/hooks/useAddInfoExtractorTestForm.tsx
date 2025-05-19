import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { infoExtractorTestFormZodSchema } from "../constants/info-extractor-test-zod-schema";
import { InformationExtractorTestDTO } from "../dtos/info-extractor-test-dto";

export const useAddInformationExtractorTestForm = () => {
  const form = useForm<z.infer<typeof infoExtractorTestFormZodSchema>>({
    resolver: zodResolver(infoExtractorTestFormZodSchema),
    defaultValues: {
      fields: [],
      tables: [],
    },
  });

  const { control } = form;

  const { fields: dataFields } = useFieldArray({
    control,
    name: "fields",
  });

  const { fields: tableFields, update } = useFieldArray({
    control,
    name: "tables",
  });

  // Function to add a new row to a specific table
  const handleAddRow = (tableIndex: number, rowIndex: number) => {
    // Get the table data to modify
    const updatedTable = [...tableFields];
    const tableData = updatedTable[tableIndex];

    // Loop through each column and insert a new value at the rowIndex position
    const newData = tableData.extractedData.map((column) => {
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
    updatedTable[tableIndex] = { ...tableData, extractedData: newData };

    // Apply the update
    update(tableIndex, updatedTable[tableIndex]);
  };

  const handleDeleteRow = (tableIndex: number, rowIndex: number) => {
    // Clone current table fields
    const updatedTable = [...tableFields];
    const tableData = updatedTable[tableIndex];

    // Remove the row at rowIndex from all columns
    const newData = tableData.extractedData.map((column) => {
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
    updatedTable[tableIndex] = { ...tableData, extractedData: newData };

    // Apply the update
    update(tableIndex, updatedTable[tableIndex]);
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    const data = queryClient.getQueryData<{
      data: InformationExtractorTestDTO;
    }>(["EXTRACTOR_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    // Only extract `name` field from fieldSetups
    const fields = setupFormData?.fieldSetups?.map((field) => ({
      name: field?.name ?? "",
    })) ?? [{}];

    // Only extract `tableName` and `headerName` from tables
    const tables =
      setupFormData?.tableMetadata?.map((table) => ({
        name: table.name,
        extractedData:
          table.tableHeaders?.map((item) => ({
            name: item.name,
            values: [], // or omit if your Zod schema allows
          })) ?? [],
      })) ?? [];

    form.reset({
      fields,
      tables,
    });
  }, [form, queryClient]);

  const refineFormData = (
    formData: z.infer<typeof infoExtractorTestFormZodSchema>,
  ) => {
    return {
      ...formData,
      fields: formData.fields.map((field) => ({
        ...field,
        accuracy: Number(field.accuracy),
      })),
    };
  };

  return {
    form,
    dataFields,
    tableFields,
    refineFormData,
    handleAddRow,
    handleDeleteRow,
  };
};
