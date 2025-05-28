/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateExtractedData } from "@/apis/extracted-data-api";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { infoExtractorTestFormZodSchema } from "../constants/info-extractor-test-zod-schema";
import { InformationExtractorSetupDTO } from "../dtos/info-extractor-setup-dto";
import { useFetchTestFormData } from "./useFetchTestFormData";

export const useAddInformationExtractorTestForm = () => {
  const { data: fieldDataValues } = useFetchTestFormData();
  const form = useForm<z.infer<typeof infoExtractorTestFormZodSchema>>({
    resolver: zodResolver(infoExtractorTestFormZodSchema),
    defaultValues: {
      fields: [],
      tables: [],
      submitForFineTuning: false,
    },
  });
  const { extractedData } = useExtractedDataStore(
    useShallow((state) => ({
      extractedData: state.extractedData,
    })),
  );
  const { selectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
    })),
  );

  console.log("fdv", fieldDataValues);

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

  const queryClient = useQueryClient();

  // Function to initialize empty field names using setup form data
  const initializeFieldNames = useCallback(async () => {
    const data = queryClient.getQueryData<{
      data: InformationExtractorSetupDTO;
    }>(["EXTRACTOR_SETUP_FORM_DATA"]);
    const setupFormData = data?.data.setupObject;

    // Only extract `tableName` and `headerName` from tables
    const tables =
      setupFormData?.tableMetadata?.map((table) => ({
        name: table.name,
        headers:
          table.tableHeaders?.map((item) => ({
            name: item.name,
            values: [""], // or omit if your Zod schema allows
          })) ?? [],
      })) ?? [];

    form.reset({
      fields: setupFormData?.fieldSetups ?? [],
      tables,
    });
  }, [form, queryClient]);

  // Function to populate field values
  const populateFieldValues = useCallback(() => {
    if (!fieldDataValues || !selectedFile) return;

    const matchingExtractedData = fieldDataValues.data.find(
      (item) => item.docId === selectedFile.id,
    );

    if (!matchingExtractedData || !matchingExtractedData.extractedData) return;

    const { extractedData, submitForFineTuning } = matchingExtractedData;

    // --- Populate Fields ---
    const existingFields = form.getValues("fields") ?? [];

    const updatedFields = existingFields.map((field) => {
      const match = extractedData.fields.find(
        (item) =>
          item.name.trim().toLowerCase() ===
          (field.name ?? "").trim().toLowerCase(),
      );

      return {
        ...field,
        value: match?.value ?? field.value ?? "",
        confidenceScore: match?.confidenceScore ?? field.confidenceScore ?? "",
      };
    });

    // --- Populate Tables ---
    const updatedTables = (extractedData.tables ?? []).map((table) => ({
      name: table.name,
      headers: table.headers.map((header) => ({
        name: header.name,
        values:
          header.values && header.values.length > 0 ? header.values : [""],
      })),
    }));

    form.reset({
      fields: updatedFields,
      tables: updatedTables,
      submitForFineTuning: submitForFineTuning ?? false,
    });
  }, [form, selectedFile, fieldDataValues]);

  useEffect(() => {
    initializeFieldNames();
    populateFieldValues();
  }, [initializeFieldNames, populateFieldValues]);

  useEffect(() => {
    const finalExtractedData = extractedData.extractedData ?? {};

    const isEmptyObject = Object.keys(finalExtractedData).length === 0;
    if (isEmptyObject) return;

    const fields = finalExtractedData.fields ?? [];
    const tables = finalExtractedData.tables ?? [];

    const isFieldsEmpty = fields.length === 0;
    const isTablesEmpty = tables.length === 0;

    // If both are empty, do nothing
    if (isFieldsEmpty && isTablesEmpty) return;

    // Use setValue instead of reset to preserve dirty/touched state
    if (!isFieldsEmpty) {
      form.setValue("fields", fields);
    }

    if (!isTablesEmpty) {
      form.setValue("tables", tables);
    }
  }, [extractedData, form]);

  const { mutateAsync: updateExtractedFormData, isPending: isUpdatePending } =
    useMutation({
      mutationFn: updateExtractedData,
      onSuccess: () => {
        toast.success("Data successfully updated.");
      },
      onError: () => {
        toast.error("Failed to update data.");
      },
    });

  return {
    form,
    dataFields,
    tableFields,
    handleAddRow,
    handleDeleteRow,
    initializeFieldNames,
    updateExtractedFormData,
    isUpdatePending,
  };
};
