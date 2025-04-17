/* eslint-disable @typescript-eslint/no-explicit-any */
import { addInfoExtractorFormZodSchema } from "../constants/add-info-extractor-zod-schema";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

interface useAddInformationExtractorFormProps {
  /** Form fields values mainly getting as response from an api and to fill the form to view or update data */
  formFieldValuesToFill?: any;
}

export const useAddInformationExtractorForm = ({
  formFieldValuesToFill,
}: useAddInformationExtractorFormProps) => {
  const form = useForm<z.infer<typeof addInfoExtractorFormZodSchema>>({
    resolver: zodResolver(addInfoExtractorFormZodSchema),
    defaultValues: {
      documentContext: "",
      inputText: "",
      dataToBeExtracted: [{ fieldName: "", type: "", instructions: "" }],
      tables: null,
      nodePrompt: "",
      saveInModelLibrary: false,
      modelName: "",
      selectedModel: null,
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
    setValue,
  } = form;

  useEffect(() => {
    if (
      formFieldValuesToFill &&
      Object.keys(formFieldValuesToFill).length > 0
    ) {
      form.reset(formFieldValuesToFill);
    }
  }, [formFieldValuesToFill, form]);

  // useFieldArray for handling the dynamic array of dataToBeExtracted
  const {
    fields: dataFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "dataToBeExtracted",
  });

  // Function to add a new object to dataToBeExtracted
  const addDataToExtracted = () => {
    append({ fieldName: "", type: "", instructions: "" });
  };

  // Function to remove an object from dataToBeExtracted
  const removeDataToExtracted = (index: number) => {
    remove(index);
  };

  // useFieldArray for handling the dynamic array of tables
  const {
    fields: tableFields,
    append: appendTable,
    remove: removeTable,
  } = useFieldArray({
    control,
    name: "tables",
  });

  // Function to add a new table to tables array
  const addTableHandler = () => {
    appendTable({
      tableContext: "",
      tableData: [{ headerName: "", type: "", instructions: "" }],
    });
  };

  // Function to remove a table from the tables array
  const removeTableHandler = (index: number) => {
    removeTable(index);
  };

  // Function to add a new table header (row) to a specific table
  const addTableHeaderHandler = (tableIndex: number) => {
    const newHeaderRow = { headerName: "", type: "", instructions: "" };

    // Access the current tables value
    const tables = form.getValues("tables");

    // Ensure we are adding the header to the right table's tableData
    if (tables && tables[tableIndex]) {
      const tableData = tables[tableIndex].tableData || [];

      // Add the new header row to the tableData
      tableData.push(newHeaderRow);

      // Update the form state using setValue, casting the field name path
      setValue(`tables`, tables);
    }
  };

  // Function to delete table row from a specific table
  const removeTableHeaderHandler = (tableIndex: number, rowIndex: number) => {
    // Get current tables value
    const tables = form.getValues("tables");

    if (!tables) return;

    // Clone the tables array to avoid mutating the state directly
    const updatedTables = [...tables];

    // Check if the table at tableIndex exists
    if (updatedTables[tableIndex]) {
      // Remove the header row at rowIndex from tableData
      updatedTables[tableIndex].tableData.splice(rowIndex, 1);

      // Update the form state with the new tables array
      setValue("tables", updatedTables);
    }
  };

  return {
    form,
    isSubmitting,
    isDirty,
    dataFields,
    addDataToExtracted,
    removeDataToExtracted,
    tableFields,
    addTableHandler,
    removeTableHandler,
    addTableHeaderHandler,
    removeTableHeaderHandler,
  };
};
