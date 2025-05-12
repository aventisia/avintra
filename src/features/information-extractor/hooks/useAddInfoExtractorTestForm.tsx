import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { infoExtractorTestFormZodSchema } from "../constants/info-extractor-test-zod-schema";

export const useAddInformationExtractorTestForm = () => {
  const form = useForm<z.infer<typeof infoExtractorTestFormZodSchema>>({
    resolver: zodResolver(infoExtractorTestFormZodSchema),
    defaultValues: {
      fields: [
        {
          fieldName: "ToPayName",
          fieldValue: "John Smith",
          accuracy: 85,
        },
        {
          fieldName: "ToAccountName",
          fieldValue: "Mark Jacob",
          accuracy: 75,
        },
        {
          fieldName: "ToBankName",
          fieldValue: "Great Bank",
          accuracy: 20,
        },
        {
          fieldName: "TOBSB",
          fieldValue: "000-098-9736",
          accuracy: 60,
        },
      ],
      tables: [
        {
          tableName: "Table 1",
          extractedData: [
            {
              headerName: "DESCRIPTION",
              values: [
                "Content Plan",
                "Copy Writing",
                "Website Design",
                "Website Development",
                "SEO",
                "Sub Total",
                "Package Discount (30%)",
                "TOTAL",
              ],
            },
            {
              headerName: "RATE",
              values: ["$50/hr", "$50/hr", "$50/hr", "$100/hr", "$50/hr"],
            },
            { headerName: "HOURS", values: ["4", "2", "5", "5", "4"] },
            {
              headerName: "AMOUNT",
              values: [
                "$200.00",
                "$100.00",
                "$250.00",
                "$500.00",
                "$200.00",
                "$1250.00",
                "$375.00",
                "$875.00",
              ],
            },
          ],
        },
        {
          tableName: "Table 2",
          extractedData: [
            { headerName: "Hrs/Qty", values: ["1.00"] },
            { headerName: "Service", values: ["Web Design Services"] },
            { headerName: "Rate/Price", values: ["$85.00"] },
            { headerName: "Adjust", values: ["0.00%"] },
            { headerName: "Sub Total", values: ["$85.00"] },
          ],
        },
      ],
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
