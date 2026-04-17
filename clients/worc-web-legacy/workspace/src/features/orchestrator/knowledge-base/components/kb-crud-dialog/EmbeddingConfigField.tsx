import { SearchableSelectField } from "@/components/searchable-select/SearchableSelectField";

import { SelectField, SwitchField } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";

import { getProviderModels } from "../../apis/llm-pipelines-apis";
import { Model, modelProviders } from "../../constants/model-providers";
import { CredentialsSelectField } from "./CredentialsSelectField";

interface EmbeddingConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const EmbeddingConfigField = ({ name }: EmbeddingConfigFieldProps) => {
  const [byokModels, setByokModels] = useState<Model[]>([]);
  const [isLoading, setByokLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  function uniqueAndNormalizeArray<T extends { value: string; label: string }>(
    arr: readonly T[],
  ): T[] {
    const map = new Map<string, T>();

    for (const item of arr) {
      map.set(item.value, {
        ...item,
        label: item.value,
      });
    }

    return Array.from(map.values());
  }

  // Field names
  const fieldNames = {
    isByokEnabled: `${name}.isByokEnabled`,
    credentialId: `${name}.credentialId`,
    provider: `${name}.provider`,
    model: `${name}.model`,
  } as const satisfies Record<string, FieldPath<FieldValues>>;

  // Form context
  const { control, setValue, formState } = useFormContext();

  // Controllers
  const { field: providerField } = useController({
    name: fieldNames.provider,
    control,
  });

  const { field: isByokField } = useController({
    name: fieldNames.isByokEnabled,
    control,
  });

  const { field: credentialsField } = useController({
    name: fieldNames.credentialId,
    control,
  });

  // Derived values
  const providerValue = providerField.value;
  const isByokEnabled = Boolean(isByokField.value);
  const credentialsValue = credentialsField.value;

  // Track previous values to detect actual changes
  const prevValues = useRef({
    isByokEnabled,
    providerValue,
    credentialsValue,
  });
  const hasInitialized = useRef(false);

  // 1. Non-BYOK providers
  const filteredProviders = useMemo(() => {
    return modelProviders
      .filter((p) => p.isEnabled !== false)
      .map((p) => ({
        ...p,
        models: p.models.filter((m) => {
          return m.specialty.includes("text") && m.available;
        }),
      }))
      .filter((p) => p.models.length > 0);
  }, []);

  // 2. Initialize on mount (for saved data)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeForm = async () => {
      if (!isByokEnabled) {
        // Static models mode - no need to fetch
        setIsInitialized(true);
      } else {
        // BYOK mode - need to fetch models if credential exists
        if (credentialsValue && providerValue) {
          try {
            setByokLoading(true);

            const mapper: Record<string, string> = {
              openai: "OpenAI",
              googlegemini: "Gemini",
              openrouter: "OpenRouter",
            };

            const provider = mapper[providerValue];
            if (provider) {
              const models = await getProviderModels(
                provider,
                credentialsValue,
              );
              setByokModels(models?.data as Model[]);
            }
          } catch (err) {
            toast.error(err as string);
            setByokModels([]);
          } finally {
            setByokLoading(false);
          }
        }
        setIsInitialized(true);
      }
    };

    initializeForm();
  }, []);

  // 3. Handle BYOK toggle (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    if (prevValues.current.isByokEnabled === isByokEnabled) return;

    prevValues.current.isByokEnabled = isByokEnabled;

    // Skip reset during initial form hydration (for edit/read mode).
    if (!formState.isDirty) return;

    // Reset dependent fields
    setValue(fieldNames.credentialId, "", { shouldDirty: true });
    setValue(fieldNames.model, "", { shouldDirty: true });
    setByokModels([]);
  }, [isByokEnabled, isInitialized, setValue, fieldNames, formState.isDirty]);

  // 4. Handle provider change (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    if (prevValues.current.providerValue === providerValue) return;

    prevValues.current.providerValue = providerValue;

    // Skip reset during initial form hydration (for edit/read mode).
    if (!formState.isDirty) return;

    // Reset dependent fields
    setValue(fieldNames.credentialId, "", { shouldDirty: true });
    setValue(fieldNames.model, "", { shouldDirty: true });
    setByokModels([]);
  }, [providerValue, isInitialized, setValue, fieldNames, formState.isDirty]);

  // 5. Fetch BYOK models on credential change
  useEffect(() => {
    if (!isInitialized) return;
    if (prevValues.current.credentialsValue === credentialsValue) return;

    prevValues.current.credentialsValue = credentialsValue;

    const fetchModels = async () => {
      try {
        setByokLoading(true);

        const mapper: Record<string, string> = {
          openai: "OpenAI",
          googlegemini: "Gemini",
          openrouter: "OpenRouter",
        };

        const provider = mapper[providerValue];
        if (!provider) {
          setByokModels([]);
          return;
        }

        const models = await getProviderModels(provider, credentialsValue);
        setByokModels(models?.data as Model[]);

        // Reset model only on user-driven credential changes.
        if (formState.isDirty) {
          setValue(fieldNames.model, "", { shouldDirty: true });
        }
      } catch (err) {
        toast.error(err as string);
        setByokModels([]);
      } finally {
        setByokLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (!providerValue || !credentialsValue) {
        setByokModels([]);
        if (formState.isDirty) {
          setValue(fieldNames.model, "", { shouldDirty: true });
        }
        return;
      }
      fetchModels();
    }, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    credentialsValue,
    isInitialized,
    providerValue,
    setValue,
    fieldNames,
    formState.isDirty,
  ]);

  // Available models
  const availableModels = useMemo(() => {
    let models = [];
    if (isByokEnabled) {
      models = byokModels;
    } else {
      const provider = filteredProviders.find((p) => p.value === providerValue);

      models = provider?.models ?? [];
    }

    return uniqueAndNormalizeArray(models);
  }, [isByokEnabled, byokModels, filteredProviders, providerValue]);

  // Current provider
  const currentProvider = filteredProviders.find(
    (p) => p.value === providerValue,
  );

  // Render component
  return (
    <div className="w-full space-y-3.5">
      <SwitchField
        size="sm"
        name={fieldNames.isByokEnabled}
        label="Bring your own API key"
        description="Enable this if you want to use your own provider API key instead of the platform-hosted models."
      />

      <SelectField
        size="base"
        isRequired
        name={fieldNames.provider}
        selectOptions={filteredProviders}
        label=" Provider"
      />

      {isByokEnabled && (
        <CredentialsSelectField
          isRequired
          name={fieldNames.credentialId}
          size="base"
          label={`${currentProvider?.label ?? ""} Credentials`}
          modelProvider={providerValue}
        />
      )}

      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <SearchableSelectField
            size="base"
            isRequired
            name={fieldNames.model}
            selectOptions={availableModels}
            label="Embedding Model"
            primaryText="Models"
            isLoading={isLoading}
            disabled={!isInitialized || (isByokEnabled && !credentialsValue)}
          />
        </div>
      </div>
    </div>
  );
};

EmbeddingConfigField.displayName = "EmbeddingConfigField";

export { EmbeddingConfigField, type EmbeddingConfigFieldProps };
