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

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const ModelConfigField = ({ name }: ModelConfigFieldProps) => {
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
    is_byok_enabled: `${name}.is_byok_enabled`,
    credential_id: `${name}.credential_id`,
    provider: `${name}.provider`,
    model: `${name}.model`,
  } as const satisfies Record<string, FieldPath<FieldValues>>;

  // Form context
  const { control, setValue } = useFormContext();

  // Controllers
  const { field: providerField } = useController({
    name: fieldNames.provider,
    control,
  });

  const { field: isByokField } = useController({
    name: fieldNames.is_byok_enabled,
    control,
  });

  const { field: credentialsField } = useController({
    name: fieldNames.credential_id,
    control,
  });

  // Derived values
  const providerValue = providerField.value;
  const is_byok_enabled = Boolean(isByokField.value);
  const credentialsValue = credentialsField.value;

  // Track previous values to detect actual changes
  const prevValues = useRef({
    is_byok_enabled,
    providerValue,
    credentialsValue,
  });

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
  }, [name]);

  // 2. Initialize on mount (for saved data)
  useEffect(() => {
    const initializeForm = async () => {
      if (!is_byok_enabled) {
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
  }, []); // Run once on mount

  // 3. Handle BYOK toggle (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    if (prevValues.current.is_byok_enabled === is_byok_enabled) return;

    prevValues.current.is_byok_enabled = is_byok_enabled;

    // Reset dependent fields
    setValue(fieldNames.credential_id, "", { shouldDirty: true });
    setValue(fieldNames.model, "", { shouldDirty: true });
    setByokModels([]);
  }, [is_byok_enabled, isInitialized, setValue, fieldNames]);

  // 4. Handle provider change (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    if (prevValues.current.providerValue === providerValue) return;

    prevValues.current.providerValue = providerValue;

    // Reset dependent fields
    setValue(fieldNames.credential_id, "", { shouldDirty: true });
    setValue(fieldNames.model, "", { shouldDirty: true });
    setByokModels([]);
  }, [providerValue, isInitialized, setValue, fieldNames]);

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

        // Reset model selection when credentials change
        setValue(fieldNames.model, "", { shouldDirty: true });
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
        setValue(fieldNames.model, "", { shouldDirty: true });
        return;
      }
      fetchModels();
    }, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [credentialsValue, isInitialized, providerValue, setValue, fieldNames]);

  // Available models
  const availableModels = useMemo(() => {
    let models = [];
    if (is_byok_enabled) {
      models = byokModels;
    } else {
      const provider = filteredProviders.find((p) => p.value === providerValue);

      models = provider?.models ?? [];
    }

    return uniqueAndNormalizeArray(models);
  }, [is_byok_enabled, byokModels, filteredProviders, providerValue]);

  // Current provider
  const currentProvider = filteredProviders.find(
    (p) => p.value === providerValue,
  );

  // Render component
  return (
    <div className="w-full space-y-3.5">
      <SwitchField
        size="sm"
        name={fieldNames.is_byok_enabled}
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

      {is_byok_enabled && (
        <CredentialsSelectField
          isRequired
          name={fieldNames.credential_id}
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
            disabled={!isInitialized || (is_byok_enabled && !credentialsValue)}
          />
        </div>
      </div>
    </div>
  );
};

ModelConfigField.displayName = "ModelConfigField";

export { ModelConfigField, type ModelConfigFieldProps };
