import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ZodTypeAny, z } from "zod";

import {
  DCPFieldSchemaType,
  generateZodSchema,
  getDefaultValuesForForm,
} from "@/features/dynamic-config-panel";

export const useDynamicForm = ({ config }: { config: DCPFieldSchemaType[] }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Flag to check if form is ready with default values.
  // It is important to set default value to all fields
  // to avoid error - "A component is changing an uncontrolled input to be controlled".
  const [isFormReady, setIsFormReady] = useState(false);

  const [configZodSchema, setConfigZodSchema] = useState<z.ZodObject<Record<string, ZodTypeAny>>>(
    () => z.object({}),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof configZodSchema>>({
    resolver: zodResolver(configZodSchema),
  });

  useEffect(() => {
    if (!config) return;

    setIsLoading(true);

    if (config) {
      setConfigZodSchema(
        z.object({
          ...generateZodSchema(config).shape,
        }),
      );
    }
    setIsLoading(false);
  }, [config]);

  // Get input and output keys (required at the time of form submission)

  const inputs = config
    ?.filter((f) => f.direction === "Input")
    ?.map((f) => {
      return { key: f.name, value: f.defaultValue };
    });

  const inputKeys: string[] = config?.filter((f) => f.direction === "Input")?.map((f) => f.name);

  // Reset form values when vaultConfig or inputs/outputs change
  useEffect(() => {
    if (config.length > 0 && Object.keys(configZodSchema.shape).length > 0) {
      form.reset({
        ...getDefaultValuesForForm(config, inputs, []),
      });
      setIsFormReady(true); // Set form ready to true after resetting the form
    }
  }, [config, configZodSchema]);

  // Destructor form values and methods
  const { control, watch } = form;

  return {
    form,
    isFormReady,
    control,
    inputKeys,
    watch,
    configZodSchema,
    isLoading,
  };
};
