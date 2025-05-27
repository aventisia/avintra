/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { updateExtractionSetupFormData } from "../apis/information-extractor-setup-apis";
import { addInfoExtractorFormZodSchema } from "../constants/add-info-extractor-zod-schema";
import { InformationExtractorSetupDTO } from "../dtos/info-extractor-setup-dto";
import { useInformationExtractorTableStore } from "../stores/info-extractor-table-store";

export const useAddInformationExtractorForm = () => {
  const form = useForm<z.infer<typeof addInfoExtractorFormZodSchema>>({
    resolver: zodResolver(addInfoExtractorFormZodSchema),
    defaultValues: {
      context: "",
      fieldSetups: [{ name: "", type: "", instructions: "" }],
      tableMetadata: null,
      prompt: `You are a highly accurate information extraction assistant. Your task is to carefully analyse the provided text and extract specific pieces of information based on predefined fields or entities.\nOnly extract relevant, factual data as it appears in the input. Do not infer, assume, or create information that is not explicitly present in the text.\nReturn the output with clearly labeled fields as per the extraction schema.\nIf a field is not present in the input, return null or "" without making assumptions.\nEnsure the extracted data is clean, free from noise, and maintains the original context.`,
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

  // const queryClient = useQueryClient();

  // useFieldArray for handling the dynamic array of fields
  const {
    fields: dataFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "fieldSetups",
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
    name: "tableMetadata",
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
    const tables = form.getValues("tableMetadata");

    // Ensure we are adding the header to the right table's tableData
    if (tables && tables[tableIndex]) {
      const tableData = tables[tableIndex].tableHeaders || [];

      // Add the new header row to the tableData
      tableData.push(newHeaderRow);

      // Update the form state using setValue, casting the field name path
      setValue(`tableMetadata`, tables);
    }
  };

  // Function to delete table row from a specific table
  const removeTableHeaderHandler = (tableIndex: number, rowIndex: number) => {
    // Get current tables value
    const tables = form.getValues("tableMetadata");

    if (!tables) return;

    // Clone the tables array to avoid mutating the state directly
    const updatedTables = [...tables];

    // Check if the table at tableIndex exists
    if (updatedTables[tableIndex]) {
      // Remove the header row at rowIndex from tableData
      updatedTables[tableIndex].tableHeaders.splice(rowIndex, 1);

      // Update the form state with the new tables array
      setValue("tableMetadata", updatedTables);
    }
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: InformationExtractorSetupDTO;
    }>(["EXTRACTOR_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    form.reset({
      context: setupFormData?.context ?? "",
      prompt: setupFormData?.prompt || form.getValues("prompt"),
      fieldSetups: setupFormData?.fieldSetups ?? [
        { name: "", type: "", instructions: "" },
      ],
      tableMetadata: setupFormData?.tableMetadata ?? null,
    });
  }, [form, queryClient]);

  // Mutation to update form data
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateExtractionSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["EXTRACTOR_SETUP_FORM_DATA"],
      });
      queryClient.invalidateQueries({
        queryKey: ["model", modelId],
      });
    },
    onError: (error) => {
      console.error("Error updating data:", error);
      toast.error("Failed to update form data");
    },
  });

  return {
    form,
    isSubmitting,
    isDirty,
    isUpdatePending,
    dataFields,
    addDataToExtracted,
    removeDataToExtracted,
    tableFields,
    addTableHandler,
    removeTableHandler,
    addTableHeaderHandler,
    removeTableHeaderHandler,
    updateFormData,
  };
};
