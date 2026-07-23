import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ZodTypeAny, z } from "zod";
import { useShallow } from "zustand/react/shallow";

import {
  DCPFieldSchemaType,
  generateZodSchema,
  // getDefaultValuesForForm,
  getNodeConfig,
  useDynamicConfigPanelStore,
} from "..";

export const useDefineDCPForm = () => {
  // Get node unique name state (required to get config panel data)
  const { nodeId, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeId: state.nodeId,
      setShowDialog: state.setShowDialog,
    })),
  );

  console.log(nodeId);

  // Local state for node config and zod schema
  const [nodeConfig, setNodeConfig] = useState<DCPFieldSchemaType[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isFormReady, setIsFormReady] = useState(false); // Flag to check if form is ready with default values. It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled".
  const [nodeConfigZodSchema, setNodeConfigZodSchema] = useState<
    z.ZodObject<Record<string, ZodTypeAny>>
  >(() => z.object({}));

  // Fetch config on mount or when nodeData changes
  useEffect(() => {
    // nodeUniqueName is not available
    if (!nodeId) return;

    setIsLoading(true);

    // Get node config from API and Set node config and zod schema
    getNodeConfig(nodeId)
      .then((config) => {
        if (config) {
          setNodeConfig(config);
          setNodeConfigZodSchema(
            z.object({
              selectAgent: z.any(),
              ...generateZodSchema(config).shape,
            }),
          );
        }
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [nodeId]);

  // Get input and output keys (required at the time of form submission)
  const inputKeys: string[] = nodeConfig?.filter((f) => f.direction === "Input").map((f) => f.name);
  const outputKeys = nodeConfig?.filter((f) => f.direction === "Output").map((f) => f.name);

  // Define form with zod schema
  const form = useForm<z.infer<typeof nodeConfigZodSchema>>({
    resolver: zodResolver(nodeConfigZodSchema),
  });

  // Reset form values when nodeConfig or inputs/outputs change
  useEffect(() => {
    if (nodeConfig.length > 0 && Object.keys(nodeConfigZodSchema.shape).length > 0) {
      // form.reset(getDefaultValuesForForm(nodeConfig, inputs, outputs));
      setIsFormReady(true); // Set form ready to true after resetting the form
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeConfig]);

  // Destructor form values and methods
  const { watch } = form;

  // Return form and methods
  return {
    form,
    watch,
    nodeConfig,
    isFormReady,
    nodeConfigZodSchema,
    inputKeys,
    outputKeys,
    setShowDialog,
    isLoading,
  };
};
