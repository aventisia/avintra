import { inferenceModelFormZodSchema } from "@/features/inferencing-model/constants/inference-model-zod-schema";
import LLMConfiguration from "@/features/llm-configuration/components/LLMConfiguration";

import { Separator } from "@aventisia/ui";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useInformationExtractorTableStore } from "../../stores/info-extractor-table-store";
import ContextTables from "./ContextTable";
import DataToBeExtracted from "./DataToBeExtracted";

interface InformationExtractorFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
}

const InformationExtractorForm = ({ form }: InformationExtractorFormProps) => {
  const { control, setValue } = form;
  const { setActiveTab } = useInformationExtractorTableStore(
    useShallow((state) => ({
      setActiveTab: state.setActiveTab,
    })),
  );

  // useFieldArray for handling the dynamic array of fields
  const {
    fields: dataFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "extraction.setupObject.fields",
  });

  // Function to add a new object to fields
  const addDataToExtracted = () => {
    append({ name: "", type: "", instructions: "" });
  };

  // Function to remove an object from fields
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
    name: "extraction.setupObject.tables",
  });

  // Function to add a new table to tables array
  const addTableHandler = () => {
    appendTable({
      context: "",
      name: `Table ${tableFields.length + 1}`,
      tableHeaders: [{ name: "", type: "", instructions: "" }],
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
    const newHeaderRow = { name: "", type: "", instructions: "" };

    // Access the current tables value
    const tables = form.getValues("extraction.setupObject.tables");

    // Ensure we are adding the header to the right table's tableData
    if (tables && tables[tableIndex]) {
      const tableData = tables[tableIndex].tableHeaders || [];

      // Add the new header row to the tableData
      tableData.push(newHeaderRow);

      // Update the form state using setValue, casting the field name path
      setValue(`extraction.setupObject.tables`, tables);
    }
  };

  // Function to delete table row from a specific table
  const removeTableHeaderHandler = (tableIndex: number, rowIndex: number) => {
    // Get current tables value
    const tables = form.getValues("extraction.setupObject.tables");

    if (!tables) return;

    // Clone the tables array to avoid mutating the state directly
    const updatedTables = [...tables];

    // Check if the table at tableIndex exists
    if (updatedTables[tableIndex]) {
      // Remove the header row at rowIndex from tableData
      updatedTables[tableIndex].tableHeaders.splice(rowIndex, 1);

      // Update the form state with the new tables array
      setValue("extraction.setupObject.tables", updatedTables);
    }
  };
  return (
    <div className="space-y-4 px-4 pb-1 w-full">
      {/* Data to be extracted */}
      <DataToBeExtracted
        addDataToExtracted={addDataToExtracted}
        dataFields={dataFields}
        form={form}
        removeDataToExtracted={removeDataToExtracted}
      />

      {/* Separator */}
      {tableFields && tableFields.length > 0 && <Separator />}

      {/* Context Table */}
      <ContextTables
        addTableHandler={addTableHandler}
        addTableHeaderHandler={addTableHeaderHandler}
        removeTableHeaderHandler={removeTableHeaderHandler}
        form={form}
        removeTableHandler={removeTableHandler}
        tableFields={tableFields}
      />

      <LLMConfiguration form={form} modelType="extraction" />
    </div>
  );
};

export default InformationExtractorForm;
