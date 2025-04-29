/* eslint-disable @typescript-eslint/no-explicit-any */
import { addInfoExtractorFormZodSchema } from "../constants/add-info-extractor-zod-schema";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useInformationExtractorTableStore } from "../stores/info-extractor-table-store";

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
      nodePrompt:
        "You are an expert extraction algorithm.\nOnly extract relevant information from the text.\nIf you do not know the value of an attribute asked to extract, you may omit the attribute's value.",
      saveInModelLibrary: false,
      modelName: "",
      selectedModel: null,
    },
  });
  const { setActiveTab } = useInformationExtractorTableStore(
    useShallow((state) => ({
      setActiveTab: state.setActiveTab,
    })),
  );

  const {
    formState: { isSubmitting, isDirty },
    control,
    setValue,
  } = form;

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
      tableName: `Table ${tableFields.length + 1}`,
      tableData: [{ headerName: "", type: "", instructions: "" }],
    });
  };

  // Function to remove a table from the tables array
  const removeTableHandler = (index: number | null) => {
    if (index === null) return;

    removeTable(index);

    // Check how many tabs are left after removal
    const remainingTabs = tableFields.length - 1;

    if (remainingTabs <= 0) {
      // If only one tab was present and it was deleted, set active tab to null
      setActiveTab(undefined);
    } else {
      // If the last tab is deleted, set the active tab to the previous one
      if (index === remainingTabs) {
        setActiveTab(`Table ${remainingTabs}`);
      } else {
        // Otherwise, set the active tab to the next tab
        setActiveTab(`Table ${index + 1}`);
      }
    }
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

  useEffect(() => {
    if (
      formFieldValuesToFill &&
      Object.keys(formFieldValuesToFill).length > 0
    ) {
      form.reset(formFieldValuesToFill);
    }
  }, [formFieldValuesToFill, form]);

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
