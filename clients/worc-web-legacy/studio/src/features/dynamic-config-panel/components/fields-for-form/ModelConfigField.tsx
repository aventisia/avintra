import { SliderField } from "@/components/Slider/SliderField";
import {
  Model,
  getSpecialtyFromNode,
  modelProviders,
} from "@/features/dynamic-config-panel/constants/model-providers";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import { buttonVariants } from "@aventisia/ui/buttons";
import { InputField, SelectField, SwitchField } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@aventisia/ui/popover";
import { toast } from "@aventisia/ui/sonner";
import { Settings2Icon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";

import { getProviderModels } from "../../apis/llm-pipelines-apis";
import { uniqueAndNormalizeArray } from "../../utils/uniqueAndNormalizeArray";
import { CredentialsSelectField } from "./CredentialsSelectField";

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const ModelConfigField = ({ name }: ModelConfigFieldProps) => {
  const [byokModels, setByokModels] = useState<Model[]>([]);
  const [isLoading, setByokLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Field names
  const fieldNames = {
    is_byok_enabled: `${name}.is_byok_enabled`,
    credential_id: `${name}.credential_id`,
    provider: `${name}.provider`,
    model: `${name}.model`,
    temperature: `${name}.temperature`,
    top_p: `${name}.top_p`,
    voice: `${name}.voice`,
    is_json_output: `${name}.is_json_output`,
    max_output_tokens: `${name}.max_output_tokens`,
  } as const satisfies Record<string, FieldPath<FieldValues>>;

  // Form context
  const { control, setValue } = useFormContext();

  // Controllers
  const { field: providerField } = useController({
    name: fieldNames.provider,
    control,
  });

  const { field: modelField } = useController({
    name: fieldNames.model,
    control,
  });

  const { field: temperatureField } = useController({
    name: fieldNames.temperature,
    control,
  });

  const { field: topPField } = useController({
    name: fieldNames.top_p,
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
    const requiredSpecialties = getSpecialtyFromNode(
      name.replace("__ModelConfig__", ""),
    );

    return modelProviders
      .filter((p) => p.isEnabled !== false)
      .map((p) => ({
        ...p,
        models: p.models.filter((m) => {
          const specialtyMatch = requiredSpecialties.every((req) =>
            m.specialty.includes(req),
          );
          return specialtyMatch && m.available;
        }),
      }));
    // .filter((p) => p.models.length > 0);
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
              anthropic: "Anthropic",
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
          anthropic: "Anthropic",
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

  // Currently selected model
  const currentModel = useMemo(() => {
    if (!modelField.value) return undefined;
    return availableModels.find((m) => m.value === modelField.value);
  }, [availableModels, modelField.value]);

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
        description="Enable this if you want to use your own LLM provider API key instead of the platform-hosted models."
      />

      <SelectField
        size="sm"
        name={fieldNames.provider}
        selectOptions={filteredProviders}
        label="Model Provider"
      />

      {is_byok_enabled && (
        <CredentialsSelectField
          name={fieldNames.credential_id}
          size="sm"
          label={`${currentProvider?.label ?? ""} Credentials`}
          modelProvider={providerValue}
        />
      )}

      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <SearchableSelectField
            size="sm"
            name={fieldNames.model}
            selectOptions={availableModels}
            label="Model"
            primaryText="Models"
            isLoading={isLoading}
            disabled={!isInitialized || (is_byok_enabled && !credentialsValue)}
          />
        </div>

        <Popover>
          <PopoverTrigger
            className={cn(
              buttonVariants({ size: "icon8", variant: "outline" }),
            )}
          >
            <Settings2Icon className="h-3 w-3" />
          </PopoverTrigger>

          <PopoverContent className="mr-6 w-[25rem] space-y-3.5 p-2">
            <Controller
              {...temperatureField}
              render={({ field }) => (
                <SliderField
                  label="Temperature"
                  name={field.name}
                  value={[field.value ?? 0.6]}
                  onValueChange={(val) => field.onChange(val[0])}
                  onValueCommit={field.onBlur}
                  min={0}
                  max={1.2}
                  step={0.1}
                />
              )}
            />

            <Controller
              {...topPField}
              render={({ field }) => (
                <SliderField
                  label="TopP"
                  name={field.name}
                  value={[field.value ?? 0.6]}
                  onValueChange={(val) => field.onChange(val[0])}
                  onValueCommit={field.onBlur}
                  min={0}
                  max={1.2}
                  step={0.1}
                />
              )}
            />

            <SwitchField
              size="sm"
              name={fieldNames.is_json_output}
              label="Is JSON Output"
              description="Enable this if you want to output in Json format."
            />

            <InputField
              name={fieldNames.max_output_tokens}
              type="number"
              label="Max Output Token"
              fieldSize="sm"
            />
          </PopoverContent>
        </Popover>
      </div>

      {currentModel?.voices?.length ? (
        <SelectField
          size="sm"
          name={fieldNames.voice}
          selectOptions={currentModel.voices}
          label="Voice"
        />
      ) : null}
    </div>
  );
};

ModelConfigField.displayName = "ModelConfigField";

export { ModelConfigField, type ModelConfigFieldProps };
