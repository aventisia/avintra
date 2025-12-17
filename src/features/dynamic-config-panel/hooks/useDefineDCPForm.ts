import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z, ZodTypeAny } from "zod";
import { useShallow } from "zustand/react/shallow";
import {
  DCPFieldSchemaType,
  generateZodSchema,
  getDefaultValuesForForm,
  getNodeConfig,
  useDynamicConfigPanelStore,
} from "..";
import { onErrorFieldsJson } from "../constants/OnErrorFields";

export const useDefineDCPForm = () => {
  // Get node unique name state (required to get config panel data)
  const { nodeId, nodeData, nodeLabel, setShowDialog } =
    useDynamicConfigPanelStore(
      useShallow((state) => ({
        nodeId: state.nodeId,
        nodeData: state.nodeData,
        nodeLabel: state.nodeLabel,
        setShowDialog: state.setShowDialog,
      })),
    );

  // Get name (activityName), inputs and outputs from nodeData
  const nodeUniqueName = nodeData?.name ?? "activityName";
  const inputs = nodeData?.inputs ?? [];
  const outputs = nodeData?.outputs ?? [];

  // Local state for node config and zod schema
  const [nodeConfig, setNodeConfig] = useState<
    | {
        errorHandling?: "standard" | "none";
        testScreenType?: "standard" | "none" | "llmGenerateRequest";
        fields: DCPFieldSchemaType[];
      }
    | DCPFieldSchemaType[]
  >({ fields: [] });

  const [fields, setFields] = useState<DCPFieldSchemaType[]>();

  const [isLoading, setIsLoading] = useState(false);

  const [tabKeys, setTabKeys] = useState<string[]>(["Inputs"]);

  const [selectedTab, setSelectedTab] = useState("");

  const [isFormReady, setIsFormReady] = useState(false); // Flag to check if form is ready with default values. It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled".
  const [nodeConfigZodSchema, setNodeConfigZodSchema] = useState<
    z.ZodObject<Record<string, ZodTypeAny>>
  >(() => z.object({}));

  // Fetch config on mount or when nodeData changes
  useEffect(() => {
    // nodeUniqueName is not available
    if (!nodeUniqueName) return;

    setIsLoading(true);

    // Get node config from API and Set node config and zod schema
    getNodeConfig(nodeUniqueName, nodeData?.type)
      .then((config) => {
        if (config) {
          const fields = Array.isArray(config) ? config : config.fields;
          const hasOnError = !Array.isArray(config) && config?.errorHandling;

          const getErrorFieldJson = (errorHandling: string) => {
            if (errorHandling == "standard") return onErrorFieldsJson;
            else return [];
          };

          setNodeConfig(
            hasOnError
              ? {
                  ...config,
                  fields: [
                    ...config.fields,
                    ...getErrorFieldJson(config.errorHandling),
                  ],
                }
              : config,
          );
          setNodeConfigZodSchema(
            generateZodSchema(
              hasOnError
                ? [...fields, ...getErrorFieldJson(config.errorHandling)]
                : fields,
            ),
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeUniqueName, nodeId]);

  // Get input and output keys (required at the time of form submission)
  const inputKeys: string[] = (
    Array.isArray(nodeConfig) ? nodeConfig : nodeConfig?.fields
  )
    ?.filter((f) => f.direction === "Input")
    .map((f) => f.name);

  const outputKeys: string[] = (
    Array.isArray(nodeConfig) ? nodeConfig : nodeConfig?.fields
  )
    ?.filter((f) => f.direction === "Output")
    .map((f) => f.name);

  // Define form with zod schema
  const form = useForm<z.infer<typeof nodeConfigZodSchema>>({
    resolver: zodResolver(nodeConfigZodSchema),
  });

  // Reset form values when nodeConfig or inputs/outputs change
  useEffect(() => {
    const fields = Array.isArray(nodeConfig) ? nodeConfig : nodeConfig?.fields;

    if (
      fields.length > 0 &&
      Object.keys(nodeConfigZodSchema.shape).length > 0
    ) {
      setFields(fields);

      form.reset(getDefaultValuesForForm(fields, inputs, outputs));
      setIsFormReady(true); // Set form ready to true after resetting the form
    }

    // generate tabs list form fields category
    const uniqueTabKeys = [
      ...new Set(fields?.map((item) => (item?.category ?? "Inputs") as string)),
    ].filter(Boolean);

    // Move "Inputs" to the front if it exists
    uniqueTabKeys.sort((a) => (a === "Inputs" ? -1 : 1));

    setTabKeys(uniqueTabKeys);
    setSelectedTab(uniqueTabKeys[0]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeConfig]);

  // Destructor form values and methods
  const { watch } = form;

  // Return form and methods
  return {
    form,
    watch,
    nodeConfig,
    fields,
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
