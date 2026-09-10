import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ZodTypeAny, z } from "zod";
import { useShallow } from "zustand/react/shallow";

import {
  DCPFieldSchemaType,
  generateZodSchema,
  getDefaultValuesForForm,
  getNodeConfig,
  useDynamicConfigPanelStore,
} from "..";
import { onErrorFieldsJson } from "../constants/OnErrorFields";
import { NodeConfigSchemaType } from "../types/node-config-schema-type";

export const useDefineDCPForm = () => {
  // Get node unique name state (required to get config panel data)
  const { nodeId, nodeData, nodeLabel, setShowDialog, selectedTab, setSelectedTab } =
    useDynamicConfigPanelStore(
      useShallow((state) => ({
        nodeId: state.nodeId,
        nodeData: state.nodeData,
        nodeLabel: state.nodeLabel,
        setShowDialog: state.setShowDialog,

        selectedTab: state.selectedTab,
        setSelectedTab: state.setSelectedTab,
      })),
    );

  // Get name (activityName), inputs and outputs from nodeData
  const nodeUniqueName = nodeData?.name ?? "activityName";
  const inputs = nodeData?.inputs ?? [];
  const outputs = nodeData?.outputs ?? [];

  // Local state for node config and zod schema
  const [nodeConfig, setNodeConfig] = useState<NodeConfigSchemaType>({
    fields: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const [tabKeys, setTabKeys] = useState<string[]>(["Inputs"]);

  const [isFormReady, setIsFormReady] = useState(false); // Flag to check if form is ready with default values. It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled".
  const [nodeConfigZodSchema, setNodeConfigZodSchema] = useState<
    z.ZodObject<Record<string, ZodTypeAny>>
  >(() => z.object({}));

  // Fetch config on mount or when nodeData changes
  useEffect(() => {
    // nodeUniqueName is not available
    if (!nodeUniqueName) return;

    setIsLoading(true);

    const getErrorFieldJson = (errorHandling?: string): DCPFieldSchemaType[] => {
      if (errorHandling == "standard") return onErrorFieldsJson;
      //TODO: Add other errorFieldsJson if more
      else return [];
    };

    // Get node config from API and Set node config and zod schema
    getNodeConfig(nodeUniqueName, nodeData?.type)
      .then((config: NodeConfigSchemaType) => {
        if (config) {
          const updatedConfig = {
            ...config,
            fields: [...config.fields, ...getErrorFieldJson(config?.errorHandling)],
          };

          setNodeConfig(updatedConfig);
          setNodeConfigZodSchema(generateZodSchema(updatedConfig.fields));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [nodeUniqueName, nodeId]);

  // Get input and output keys (required at the time of form submission)
  const inputKeys: string[] = nodeConfig?.fields
    ?.filter((f) => f.direction === "Input")
    .map((f) => f.name);

  const outputKeys: string[] = nodeConfig?.fields
    ?.filter((f) => f.direction === "Output")
    .map((f) => f.name);

  // Define form with zod schema
  const form = useForm<z.infer<typeof nodeConfigZodSchema>>({
    resolver: zodResolver(nodeConfigZodSchema),
  });

  // Reset form values when nodeConfig or inputs/outputs change
  useEffect(() => {
    if (nodeConfig.fields.length > 0 && Object.keys(nodeConfigZodSchema.shape).length > 0) {
      form.reset(getDefaultValuesForForm(nodeConfig.fields, inputs, outputs));
      setIsFormReady(true); // Set form ready to true after resetting the form
    }

    // generate tabs list form fields category
    const uniqueTabKeys = [
      ...new Set(nodeConfig.fields?.map((item) => (item?.category ?? "Inputs") as string)),
    ].filter(Boolean);

    // Move "Inputs" to the front if it exists
    uniqueTabKeys.sort((a) => (a === "Inputs" ? -1 : 1));

    setTabKeys(uniqueTabKeys);
    setSelectedTab(uniqueTabKeys[0]);
  }, [nodeConfig]);

  // Destructor form values and methods
  const { watch } = form;

  // Publish dirty state for the navigation guard (X / Escape / node switch).
  // Reading formState.isDirty during render subscribes to dirty updates.
  const isFormDirtyNow = form.formState.isDirty;
  useEffect(() => {
    useDynamicConfigPanelStore.getState().setIsFormDirty(isFormDirtyNow);
    return () => {
      useDynamicConfigPanelStore.getState().setIsFormDirty(false);
    };
  }, [isFormDirtyNow]);

  // Return form and methods
  return {
    form,
    watch,
    nodeConfig,
    isFormReady,
    nodeConfigZodSchema,
    nodeId,
    nodeUniqueName,
    inputKeys,
    outputKeys,
    nodeLabel,
    setShowDialog,
    isLoading,
    tabKeys,
    selectedTab,
    setSelectedTab,
  };
};
