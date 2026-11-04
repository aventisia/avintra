import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
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

import { isVaultCredentialNameAvailable } from "../../apis/vault-credentials.apis";
import { vaultCredentialNameSchema } from "../../constants/vault-credential-zod-schema.constant";
import { VaultCredentialDto } from "../../dtos/vault-credentials.dto";
import { useTableTab } from "../../hooks/useTableTab";
import { appToVaultCredentialNameMapper } from "../constants/app-to-vault-credential-name-mapper.constant";
import {
  getCustomApiToolDefaultValues,
  getCustomApiToolVaultCredentialSchema,
  mapCustomApiToolDataToFormValues,
} from "../constants/custom-api-tool-schema.constant";
import { vaultCredentialAppsSelectOptions } from "../constants/vault-credential-app-select-options.constant";

interface UseVaultCredentialDynamicFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

export const useVaultCredentialDynamicForm = ({
  rowId,
  crudAction,
}: UseVaultCredentialDynamicFormOptions) => {
  const [credName, setCredName] = useState("");

  const [vaultCredentialConfig, setVaultCredentialConfig] = useState<DCPFieldSchemaType[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // IMPORTANT NOTE: All form fields must have default values or React throws
  // "A component is changing an uncontrolled input to be controlled".
  const [isFormReady, setIsFormReady] = useState(false);

  const [vaultCredentialConfigZodSchema, setVaultCredentialConfigZodSchema] = useState<
    z.ZodObject<Record<string, ZodTypeAny>>
  >(() => z.object({}));

  const { setIsDirty } = useCrudDialogDirty();

  const { queryKey } = useTableTab();
  const queryClient = useQueryClient();

  const vaultCredentialsData = getMergedQueryData<VaultCredentialDto>(queryClient, queryKey);

  const vaultCredentialData = vaultCredentialsData?.data.find((item) => item.id === rowId);

  const form = useForm<z.infer<typeof vaultCredentialConfigZodSchema>>({
    resolver: zodResolver(vaultCredentialConfigZodSchema),
  });

  const selectedTypeValue = vaultCredentialData?.type ?? form.watch("selectedType")?.value;
  const isCustomApiTool = selectedTypeValue === "CustomApiTool";

  const selectedType = vaultCredentialData
    ? vaultCredentialData?.type
    : form.watch("selectedType")?.value;

  useEffect(() => {
    if (!selectedType) return;

    if (isCustomApiTool) {
      setVaultCredentialConfig([]);
      setVaultCredentialConfigZodSchema(getCustomApiToolVaultCredentialSchema());
      return;
    }

    setIsLoading(true);

    getNodeConfig(selectedType)
      .then((config) => {
        if (config) {
          setVaultCredentialConfig(config);
          setVaultCredentialConfigZodSchema(
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

  const inputKeys: string[] = vaultCredentialConfig
    ?.filter((f) => f.direction === "Input")
    ?.map((f) => f.name);
  const outputKeys = vaultCredentialConfig
    ?.filter((f) => f.direction === "Output")
    ?.map((f) => f.name);

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
  } = useCheckAvailability<z.infer<typeof vaultCredentialConfigZodSchema>, z.ZodString>({
    defaultInputValue: credName,
    fieldName: "name",
    form,
    fieldSchema: vaultCredentialNameSchema,
    checkAvailabilityAPIFn: isVaultCredentialNameAvailable,
  });

  useEffect(() => {
    const schemaKeys = Object.keys(vaultCredentialConfigZodSchema.shape);
    if (schemaKeys.length === 0) return;

    const savedData = vaultCredentialData?.data || {};

    const selectedTypeOption = Object.values(vaultCredentialAppsSelectOptions).find(
      (option) =>
        option.value ===
        (vaultCredentialData ? vaultCredentialData?.type : form.watch("selectedType")?.value),
    );

    const selectedTypeValue = vaultCredentialData?.type ?? form.watch("selectedType")?.value;
    const name = vaultCredentialData?.name ?? appToVaultCredentialNameMapper[selectedTypeValue];

    setCredName(name);

    if (crudAction == "create") checkAvailabilityMutation({ userInput: name });

    if (isCustomApiTool) {
      const mapped = mapCustomApiToolDataToFormValues(vaultCredentialData);
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
      isDisabled: vaultCredentialData?.isDisabled,
      ...getDefaultValuesForForm(
        vaultCredentialConfig,
        convertFromObject(savedData) as unknown as NodeInputType[],
      ),
    });
    setIsFormReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultCredentialConfig, vaultCredentialConfigZodSchema]);

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
    vaultCredentialConfig,
    vaultCredentialConfigZodSchema,
    isLoading,
    convertToObject,
    action: crudAction,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    vaultCredentialData,
    isCustomApiTool,
  };
};
