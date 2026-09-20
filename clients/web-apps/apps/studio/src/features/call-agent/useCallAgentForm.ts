import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ZodTypeAny, z } from "zod";
import { useShallow } from "zustand/react/shallow";

import {
  DCPFieldSchemaType,
  generateZodSchema,
  getDefaultValuesForForm,
  useDynamicConfigPanelStore,
} from "@/features/dynamic-config-panel";
import { getFlowToLoad } from "@/features/react-flow/apis/react-flow-apis";

import { useGetSelectedAgentData } from "./useGetSelectedAgentData";

/**
 * Defines the CallAgent config form: loads the selected agent's IO schema,
 * builds validation, and publishes dirty state for the panel boundary guards.
 */
export const useCallAgentForm = () => {
  // Local state for node config and zod schema
  const [nodeConfig, setNodeConfig] = useState<DCPFieldSchemaType[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [, setIsFormReady] = useState(false); // Flag to check if form is ready with default values. It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled".

  const [nodeConfigZodSchema, setNodeConfigZodSchema] = useState<
    z.ZodObject<Record<string, ZodTypeAny>>
  >(() => z.object({}));

  // Get node unique name state (required to get config panel data)
  const { nodeId, nodeData, nodeLabel } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeId: state.nodeId,
      nodeData: state.nodeData,
      nodeLabel: state.nodeLabel,
    })),
  );

  const { getSelectedAgentData } = useGetSelectedAgentData();

  const initialSelectedAgent = getSelectedAgentData(nodeId || "");
  // Define form with zod schema
  const form = useForm<z.infer<typeof nodeConfigZodSchema>>({
    resolver: zodResolver(nodeConfigZodSchema),
    defaultValues: {
      selectAgent: initialSelectedAgent ?? null,
    },
  });

  // Watch the selected value from the form
  const selectedAgent = form.watch("selectAgent");

  // Extract stable primitive values for effect dependencies
  const selectedAgentId = selectedAgent?.id;
  const selectedAgentFlowId = selectedAgent?.flowId;

  // Get name (activityName), inputs and outputs from nodeData
  const nodeUniqueName = nodeData?.name ?? "CallAgentActivity";

  const inputs = nodeData?.inputs ?? [];
  const outputs = nodeData?.outputs ?? [];

  // Fetch config on mount or when nodeData changes
  useEffect(() => {
    if (!selectedAgentId || !selectedAgentFlowId) {
      setNodeConfig([]);
      setNodeConfigZodSchema(z.object({}));
      setIsLoading(false);
      setIsFormReady(true);
      return;
    }

    let isCancelled = false;

    setIsLoading(true);
    setIsFormReady(false);

    getFlowToLoad(selectedAgentFlowId, selectedAgentId)
      .then((config) => {
        if (isCancelled) return;

        if (config?.data?.inputOutputObject) {
          const IOObj = JSON.parse(config?.data.inputOutputObject || "{}");

          setNodeConfig(IOObj);
          setNodeConfigZodSchema(
            z.object({
              selectAgent: z.any().nullable().optional(),
              ...generateZodSchema(IOObj).shape,
            }),
          );
          return;
        }

        setNodeConfig([]);
        setNodeConfigZodSchema(
          z.object({
            selectAgent: z.any().nullable().optional(),
          }),
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedAgentId, selectedAgentFlowId]); // ✅ Only primitive deps

  // Reset form values when nodeConfig or inputs/outputs change
  useEffect(() => {
    if (nodeConfig.length > 0 && Object.keys(nodeConfigZodSchema.shape).length > 0) {
      const currentSelectedAgent = form.getValues("selectAgent") ?? null;

      form.reset({
        ...getDefaultValuesForForm(nodeConfig, inputs, outputs),
        selectAgent: currentSelectedAgent,
      });
      setIsFormReady(true); // Set form ready to true after resetting the form
    }
  }, [nodeConfig]);

  // Destructor form values and methods
  const {
    formState: { isDirty },
    watch,
  } = form;

  // The node name is stored in the DCP store, not in react-hook-form, so a
  // rename alone never makes formState dirty. Track it explicitly.
  const isLabelDirty = !!nodeLabel && nodeLabel !== nodeData?.label;

  // Publish dirty state for the navigation guard (X / Escape / node switch)
  useEffect(() => {
    useDynamicConfigPanelStore.getState().setIsFormDirty(isDirty || isLabelDirty);
    return () => {
      useDynamicConfigPanelStore.getState().setIsFormDirty(false);
    };
  }, [isDirty, isLabelDirty]);

  return {
    form,
    isLabelDirty,
    nodeLabel,
    nodeId,
    nodeUniqueName,
    watch,
    nodeConfig,
    isLoading,
  };
};
