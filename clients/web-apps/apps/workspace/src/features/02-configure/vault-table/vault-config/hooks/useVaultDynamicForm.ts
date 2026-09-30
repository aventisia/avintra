import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { reqError } from "@avplatform/ui/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ZodTypeAny, z } from "zod";

import {
  DCPFieldSchemaType,
  generateZodSchema,
  getDefaultValuesForForm,
  getNodeConfig,
} from "@/features/dynamic-config-panel";
import { NodeInputType } from "@/features/dynamic-config-panel/types/input-output-types";
import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { isVaultNameAvailable } from "../../apis/vaults-table-apis";
import { vaultNameSchema } from "../../constants/vault-zod-schema";
import { VaultsTableDto } from "../../dtos/vaults-table-dto";
import { useTableTab } from "../../hooks/useTableTab";
import { appToCredentialNameMapper } from "../constants/app-to-credential-name-mapper";
import {
  getCustomApiToolDefaultValues,
  getCustomApiToolVaultSchema,
  mapCustomApiToolDataToFormValues,
} from "../constants/custom-api-tool-schema";
import { vaultAppsSelectOptions } from "../constants/vault-app-select-options";

interface UseVaultDynamicFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

export const useVaultDynamicForm = ({ rowId, crudAction }: UseVaultDynamicFormOptions) => {
  // Set credential name state (required for availability check)
  const [credName, setCredName] = useState("");

  // Local state for vault config and zod schema
  const [vaultConfig, setVaultConfig] = useState<DCPFieldSchemaType[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isFormReady, setIsFormReady] = useState(false); // Flag to check if form is ready with default values. It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled".

  const [vaultConfigZodSchema, setVaultConfigZodSchema] = useState<
    z.ZodObject<Record<string, ZodTypeAny>>
  >(() => z.object({}));

  const { setIsDirty } = useCrudDialogDirty();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();
  // Get query client
  const queryClient = useQueryClient();

  // Get vaults data from the merged Personal/Shared lists in the cache
  const vaultsData = getMergedQueryData<VaultsTableDto>(queryClient, queryKey);

  // Get vault data by id
  const vaultData = vaultsData?.data.find((item) => item.id === rowId);

  // Define form with zod schema.
  const form = useForm<z.infer<typeof vaultConfigZodSchema>>({
    resolver: zodResolver(vaultConfigZodSchema),
  });

  // CustomApiTool uses a dedicated form schema instead of dynamic config.
  const selectedTypeValue = vaultData?.type ?? form.watch("selectedType")?.value;
  const isCustomApiTool = selectedTypeValue === "CustomApiTool";

  // Extract stable primitive values for effect dependencies
  const selectedType = vaultData ? vaultData?.type : form.watch("selectedType")?.value;

  // Fetch config on mount or when vaultData changes
  useEffect(() => {
    if (!selectedType) return;

    // CustomApiTool uses a dedicated form schema; skip dynamic config loading.
    if (isCustomApiTool) {
      setVaultConfig([]);
      setVaultConfigZodSchema(getCustomApiToolVaultSchema());
      return;
    }

    setIsLoading(true);

    // Get vault config from API and Set vault config and zod schema
    getNodeConfig(selectedType)
      .then((config) => {
        if (config) {
          setVaultConfig(config);
          setVaultConfigZodSchema(
            z.object({
              selectedType: z.any(),
              name: z.string().min(1, { message: reqError("Name") }),
              ...generateZodSchema(config).shape,
              isDisabled: z.boolean().optional(),
            }),
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]); // ✅ Only primitive deps

  // Get input and output keys (required at the time of form submission)
  const inputKeys: string[] = vaultConfig
    ?.filter((f) => f.direction === "Input")
    ?.map((f) => f.name);
  const outputKeys = vaultConfig?.filter((f) => f.direction === "Output")?.map((f) => f.name);

  function convertFromObject<T>(
    obj: Record<string, T>,
    excludeKeys?: string[],
  ): Array<{ key: string; value: T }> {
    return Object.entries(obj)
      .filter(([key]) => !excludeKeys?.includes(key))
      .map(([key, value]) => ({ key, value }));
  }

  function convertToObject<T>(
    arr: Array<{ key: string; value: T }>,
    excludeKeys?: string[],
  ): Record<string, T> {
    return arr.reduce(
      (acc, { key, value }) => {
        if (!excludeKeys?.includes(key)) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, T>,
    );
  }
  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    checkAvailabilityMutation,
  } = useCheckAvailability<z.infer<typeof vaultConfigZodSchema>, z.ZodString>({
    defaultInputValue: credName,
    fieldName: "name",
    form,
    fieldSchema: vaultNameSchema,
    checkAvailabilityAPIFn: isVaultNameAvailable,
  });

  // Reset form values when vaultConfig or inputs/outputs change
  useEffect(() => {
    const schemaKeys = Object.keys(vaultConfigZodSchema.shape);
    if (schemaKeys.length === 0) return;

    const savedData = vaultData?.data || {};

    const selectedTypeOption = Object.values(vaultAppsSelectOptions).find(
      (option) =>
        option.value === (vaultData ? vaultData?.type : form.watch("selectedType")?.value),
    );

    const selectedTypeValue = vaultData?.type ?? form.watch("selectedType")?.value;
    const name = vaultData?.name ?? appToCredentialNameMapper[selectedTypeValue];

    setCredName(name);

    if (crudAction == "create") checkAvailabilityMutation({ userInput: name });

    // CustomApiTool has its own form schema and default values.
    if (isCustomApiTool) {
      const mapped = mapCustomApiToolDataToFormValues(vaultData);
      const isCreate = crudAction === "create";

      form.reset({
        ...getCustomApiToolDefaultValues({
          selectedType: selectedTypeOption,
          name: isCreate ? name : (mapped.name ?? ""),
          description: isCreate ? "" : mapped.description,
          authenticationType: isCreate ? undefined : mapped.authenticationType,
          bearerToken: isCreate ? "" : (mapped.bearerToken ?? ""),
          basicUsername: isCreate ? "" : (mapped.basicUsername ?? ""),
          basicPassword: isCreate ? "" : (mapped.basicPassword ?? ""),
          apiKeyHeaderName: isCreate ? "" : (mapped.apiKeyHeaderName ?? ""),
          apiKeyHeaderValue: isCreate ? "" : (mapped.apiKeyHeaderValue ?? ""),
          apiKeyQueryName: isCreate ? "" : (mapped.apiKeyQueryName ?? ""),
          apiKeyQueryValue: isCreate ? "" : (mapped.apiKeyQueryValue ?? ""),
          isDisabled: isCreate ? false : (mapped.isDisabled ?? false),
        }),
      });
      setIsFormReady(true);
      return;
    }

    form.reset({
      selectedType: selectedTypeOption,
      name: name,
      isDisabled: vaultData?.isDisabled,
      ...getDefaultValuesForForm(
        vaultConfig,
        convertFromObject(savedData) as unknown as NodeInputType[],
      ),
    });
    setIsFormReady(true); // Set form ready to true after resetting the form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultConfig, vaultConfigZodSchema]);

  // Destructor form values and methods
  const {
    control,
    formState: { isDirty },
    watch,
  } = form;

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  return {
    form,
    isDirty,
    control,
    rowId,
    inputKeys,
    outputKeys,
    isFormReady,
    watch,
    vaultConfig,
    vaultConfigZodSchema,
    isLoading,
    convertToObject,
    action: crudAction,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    vaultData,
    isCustomApiTool,
  };
};
