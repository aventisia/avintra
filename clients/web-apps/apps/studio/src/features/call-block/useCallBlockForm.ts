import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ZodTypeAny, z } from "zod";
import { useShallow } from "zustand/react/shallow";

import {
  DCPFieldSchemaType,
  generateZodSchema,
  useDynamicConfigPanelStore,
} from "@/features/dynamic-config-panel";
import { getFlowToLoad } from "@/features/react-flow/apis/react-flow-apis";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { useGetSelectedBlockData } from "./useGetSelectedBlockData";

const OUTPUT_KEY_PREFIX = "__output__";

/**
 * Build form configuration that avoids input/output key collisions by prefixing
 * colliding output field names. Returns the transformed config and a map of
 * formKey -> original output key for de-mapping on submit.
 */
function buildFormConfig(fields: DCPFieldSchemaType[]): {
  formConfig: DCPFieldSchemaType[];
  outputKeyMap: Record<string, string>;
} {
  const inputNames = new Set(fields.filter((f) => f.direction === "Input").map((f) => f.name));

  const outputKeyMap: Record<string, string> = {};

  const formConfig = fields.map((field) => {
    if (field.direction === "Output" && inputNames.has(field.name)) {
      const formKey = `${OUTPUT_KEY_PREFIX}${field.name}`;
      outputKeyMap[formKey] = field.name;
      return { ...field, name: formKey };
    }
    return field;
  });

  return { formConfig, outputKeyMap };
}

/**
 * Generate default form values from the transformed config, inputs, and outputs.
 * This mirrors getDefaultValuesForForm but respects the namespaced output keys.
 */
function getDefaultValuesForCallBlock(
  formConfig: DCPFieldSchemaType[],
  inputs: NodeInputType[],
  outputs: NodeOutputType[],
): Record<string, unknown> {
  const inputMap = Object.fromEntries(inputs.map((i) => [i.key, i.value]));
  const outputMap = Object.fromEntries(outputs.map((o) => [o.key, o.value]));

  const defaultValues: Record<string, unknown> = {};

  for (const field of formConfig) {
    const key = field.name;
    const originalKey =
      field.direction === "Output" && key.startsWith(OUTPUT_KEY_PREFIX)
        ? key.slice(OUTPUT_KEY_PREFIX.length)
        : key;

    if (field.direction === "Input") {
      defaultValues[key] = inputMap[key] !== undefined ? inputMap[key] : field.defaultValue;
    } else if (field.direction === "Output") {
      defaultValues[key] =
        outputMap[originalKey] !== undefined ? outputMap[originalKey] : field.defaultValue;
    }
  }

  return defaultValues;
}

/**
 * Defines the CallBlock config form: loads the selected block's IO schema,
 * builds validation, and publishes dirty state for the panel boundary guards.
 */
export const useCallBlockForm = () => {
  // Local state for node config and zod schema
  const [nodeConfig, setNodeConfig] = useState<DCPFieldSchemaType[]>([]);

  const [outputKeyMap, setOutputKeyMap] = useState<Record<string, string>>({});

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

  const { getSelectedBlockData } = useGetSelectedBlockData();

  const initialSelectedBlock = getSelectedBlockData(nodeId || "");
  // Define form with zod schema
  const form = useForm<z.infer<typeof nodeConfigZodSchema>>({
    resolver: zodResolver(nodeConfigZodSchema),
    defaultValues: {
      selectBlock: initialSelectedBlock ?? null,
    },
  });

  // Watch the selected value from the form
  const selectedBlock = form.watch("selectBlock");

  // Extract stable primitive values for effect dependencies
  const selectedBlockId = selectedBlock?.id;
  const selectedBlockFlowId = selectedBlock?.flowId;

  // Get name (activityName), inputs and outputs from nodeData
  const nodeUniqueName = nodeData?.name ?? "CallBlockActivity";

  const inputs = nodeData?.inputs ?? [];
  const outputs = nodeData?.outputs ?? [];

  // Fetch config on mount or when nodeData changes
  useEffect(() => {
    if (!selectedBlockId || !selectedBlockFlowId) {
      setNodeConfig([]);
      setOutputKeyMap({});
      setNodeConfigZodSchema(z.object({}));
      setIsLoading(false);
      setIsFormReady(true);
      return;
    }

    let isCancelled = false;

    setIsLoading(true);
    setIsFormReady(false);

    getFlowToLoad(selectedBlockFlowId, selectedBlockId)
      .then((config) => {
        if (isCancelled) return;

        if (config?.data?.inputOutputObject) {
          const IOObj = JSON.parse(config?.data.inputOutputObject || "{}");
          const { formConfig, outputKeyMap: map } = buildFormConfig(IOObj);

          setNodeConfig(formConfig);
          setOutputKeyMap(map);
          setNodeConfigZodSchema(
            z.object({
              selectBlock: z.any().nullable().optional(),
              ...generateZodSchema(formConfig).shape,
            }),
          );
          return;
        }

        setNodeConfig([]);
        setOutputKeyMap({});
        setNodeConfigZodSchema(
          z.object({
            selectBlock: z.any().nullable().optional(),
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
  }, [selectedBlockId, selectedBlockFlowId]); // ✅ Only primitive deps

  // Reset form values when nodeConfig or inputs/outputs change
  useEffect(() => {
    if (nodeConfig.length > 0 && Object.keys(nodeConfigZodSchema.shape).length > 0) {
      const currentSelectedBlock = form.getValues("selectBlock") ?? null;

      form.reset({
        ...getDefaultValuesForCallBlock(nodeConfig, inputs, outputs),
        selectBlock: currentSelectedBlock,
      });
      setIsFormReady(true); // Set form ready to true after resetting the form
    }
  }, [nodeConfig, nodeConfigZodSchema, inputs, outputs]);

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
    outputKeyMap,
    isLoading,
  };
};
