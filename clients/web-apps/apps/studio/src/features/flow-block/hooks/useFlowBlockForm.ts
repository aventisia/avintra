import { useUserSessionStore } from "@avplatform/ui/stores";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { getUserDisplayName } from "@avplatform/ui/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { DCPJsonToFormData } from "@/features/add-input-output/utils/jsonToFormdata";

import { getFlowBlock } from "../apis/flow-block-apis";
import {
  FieldItemFormValues,
  InputsOutputsFieldsFormType,
  OutputFieldFormValues,
  createBlockFormSchema,
  createBlockFormType,
} from "../constants/flow-block-zod-schema";

/**
 * Custom hook for defining a form.
 */
export const useFlowBlockForm = () => {
  const inputDefault: FieldItemFormValues = {
    direction: "Input",
    name: "",
    label: "",
    defaultValue: "",
    type: "text",
    required: false,
  };

  const outputDefault: OutputFieldFormValues = {
    direction: "Output",
    name: "",
    label: "",
    defaultValue: "",
    type: "config-panel-output",
  };

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
    toggleFormDirty,
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // Define form with zod schema
  const form = useForm<createBlockFormType>({
    resolver: zodResolver(createBlockFormSchema),
    defaultValues: {
      id: "",
      description: "",
      name: "",
      type: "",
      inputs: [],
      outputs: [],
      createdBy: getUserDisplayName(userSession),
      createdOn: new Date(),
      lastModifiedBy: getUserDisplayName(userSession),
      lastModifiedOn: new Date(),
    },
  });

  // Destructor form values and methods
  const {
    control,
    formState: { isDirty },
  } = form;

  const { data: flowData } = useQuery({
    queryFn: () => getFlowBlock(rowId || "flowId"),
    queryKey: ["flow-block", rowId],
    enabled: !!rowId && crudAction == "update",
  });

  // Fetch flow data when rowId changes
  useEffect(() => {
    let IOObj: InputsOutputsFieldsFormType = {};
    if (flowData) {
      if (Object.keys(JSON.parse(flowData?.data.inputOutputObject || "")).length > 0) {
        IOObj = DCPJsonToFormData(JSON.parse(flowData?.data.inputOutputObject || ""));
      }

      // Set flow data to form
      form.reset({
        id: rowId,
        type: flowData?.data?.type ?? "",
        name: flowData?.data?.name ?? "",
        description: flowData?.data?.description ?? "",
        ...IOObj,

        createdBy: flowData?.data?.createdBy ?? getUserDisplayName(userSession),
        createdOn: flowData?.data?.createdOn ? new Date(flowData?.data?.createdOn) : new Date(),
        lastModifiedBy: flowData?.data?.lastModifiedBy ?? getUserDisplayName(userSession),
        lastModifiedOn: flowData?.data?.lastModifiedOn
          ? new Date(flowData?.data?.lastModifiedOn)
          : new Date(),
      });
    }
  }, [flowData, form, rowId, userSession]);

  // Refine form data based on crud action
  const refineFormData = (formData: createBlockFormType) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { inputs, outputs, ...rest } = formData;
    return {
      ...rest,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  const {
    fields: inputFields,
    append: appendInput,
    remove: removeInput,
  } = useFieldArray({
    control,
    name: "inputs",
  });

  const {
    fields: outputFields,
    append: appendOutput,
    remove: removeOutput,
  } = useFieldArray({
    control,
    name: "outputs",
  });

  return {
    form,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
    control,
    inputFields,
    appendInput,
    removeInput,
    outputFields,
    appendOutput,
    removeOutput,
    inputDefault,
    outputDefault,
  };
};
