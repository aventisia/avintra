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

import { isVaultCredentialNameAvailable } from "../../apis/vaults-table-apis";
import { vaultNameSchema } from "../../constants/vault-zod-schema";
import { VaultCredentialDto } from "../../dtos/vaults-table-dto";
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
  const [credName, setCredName] = useState("");

  const [vaultConfig, setVaultConfig] = useState<DCPFieldSchemaType[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // IMPORTANT NOTE: All form fields must have default values or React throws
  // "A component is changing an uncontrolled input to be controlled".
  const [isFormReady, setIsFormReady] = useState(false);

  const [vaultConfigZodSchema, setVaultConfigZodSchema] = useState<
    z.ZodObject<Record<string, ZodTypeAny>>
  >(() => z.object({}));

  const { setIsDirty } = useCrudDialogDirty();

  const { queryKey } = useTableTab();
  const queryClient = useQueryClient();

  const vaultsData = getMergedQueryData<VaultCredentialDto>(queryClient, queryKey);

  const vaultData = vaultsData?.data.find((item) => item.id === rowId);

  const form = useForm<z.infer<typeof vaultConfigZodSchema>>({
    resolver: zodResolver(vaultConfigZodSchema),
  });

  const selectedTypeValue = vaultData?.type ?? form.watch("selectedType")?.value;
  const isCustomApiTool = selectedTypeValue === "CustomApiTool";

  const selectedType = vaultData ? vaultData?.type : form.watch("selectedType")?.value;

  useEffect(() => {
    if (!selectedType) return;

    if (isCustomApiTool) {
      setVaultConfig([]);
      setVaultConfigZodSchema(getCustomApiToolVaultSchema());
      return;
    }

    setIsLoading(true);

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
  }, [selectedType]);

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
    checkAvailabilityAPIFn: isVaultCredentialNameAvailable,
  });

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
    setIsFormReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultConfig, vaultConfigZodSchema]);

  const {
    control,
    formState: { isDirty },
    watch,
  } = form;

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
