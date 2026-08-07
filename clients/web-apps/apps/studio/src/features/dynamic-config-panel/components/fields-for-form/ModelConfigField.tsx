import { buttonVariants } from "@avplatform/ui/buttons";
import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { toast } from "@avplatform/ui/sonner";
import { Settings2Icon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useController, useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import {
  Model,
  getSpecialtyFromNode,
  modelProviders,
} from "@/features/dynamic-config-panel/constants/model-providers";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import { getProviderModels } from "../../apis/llm-pipelines-apis";
import { embeddingModelProviders } from "../../constants/embedding-model-providers";
import { sttModelProviders } from "../../constants/stt-model-proivder";
import { ttsModelProviders } from "../../constants/tts-model-proivder";
import { TenantModelProviderDto } from "../../dtos/tenant-model-provider-dto";
import { useFetchTenantModelProviders } from "../../hooks/useFetchTenantModelProviders";
import { uniqueAndNormalizeArray } from "../../utils/uniqueAndNormalizeArray";
import { CredentialsSelectField } from "./CredentialsSelectField";

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const PROVIDER_MAP: Record<string, string> = {
  openai: "OpenAI",
  googlegemini: "Gemini",
  openrouter: "OpenRouter",
  anthropic: "Anthropic",
  elevenlabs: "ElevenLabs",
  ollama: "Ollama",
  ollamacloud: "OllamaCloud",
};

// Studio provider values whose models are sourced from the tenant config's
// "enabledModelIds" (per the Tenant Admin "Model Providers" section) rather than
// fetched dynamically via a credential (e.g. Ollama On-prem).
const TENANT_CONFIG_MODEL_PROVIDERS = new Set(["ollama"]);

const ModelConfigField = ({ name }: ModelConfigFieldProps) => {
  const [byokModels, setByokModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { control, setValue } = useFormContext();
  const nodeKey = name.replace("__ModelConfig__", "");

  // Fetch the tenant's enabled model-provider configurations (Tenant Admin > Model Providers).
  const { data: tenantProvidersData } = useFetchTenantModelProviders();

  // Configs that are enabled (not disabled) for this tenant.
  const enabledTenantConfigs = useMemo(
    () => (tenantProvidersData?.data ?? []).filter((c) => !c.isDisabled),
    [tenantProvidersData],
  );

  // Map a studio provider value (e.g. "googlegemini") to the enabled tenant config
  // for that provider (backend type e.g. "Gemini"). Only includes enabled providers.
  const enabledConfigByProvider = useMemo(() => {
    const map: Record<string, TenantModelProviderDto> = {};
    for (const [studioValue, backendType] of Object.entries(PROVIDER_MAP)) {
      const config = enabledTenantConfigs.find((c) => c.providerType === backendType);
      if (config) map[studioValue] = config;
    }
    return map;
  }, [enabledTenantConfigs]);

  // 1. Memoize Field Names to prevent effect loops
  const fieldNames = useMemo(
    () =>
      ({
        is_byok_enabled: `${name}.is_byok_enabled`,
        credential_id: `${name}.credential_id`,
        provider: `${name}.provider`,
        model: `${name}.model`,
        voice: `${name}.voice`,
        temperature: `${name}.temperature`,
        top_p: `${name}.top_p`,
        is_json_output: `${name}.is_json_output`,
        max_output_tokens: `${name}.max_output_tokens`,
      }) as const,
    [name],
  );

  // 2. Controllers
  const { field: isByokField } = useController({
    name: fieldNames.is_byok_enabled,
    control,
  });
  const { field: providerField } = useController({
    name: fieldNames.provider,
    control,
  });
  const { field: modelField } = useController({
    name: fieldNames.model,
    control,
  });
  const { field: credentialsField } = useController({
    name: fieldNames.credential_id,
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

  const is_byok_enabled = Boolean(isByokField.value);
  const providerValue = providerField.value;
  const credentialsValue = credentialsField.value;

  const prevValues = useRef({
    is_byok_enabled,
    providerValue,
    credentialsValue,
  });

  const enableModelSetup = useMemo(
    () => ["__ModelConfig__Inferencing", "__ModelConfig__Conversation"].includes(name),
    [name],
  );

  // 3. Filtered Data
  const filteredProviders = useMemo(() => {
    const requiredSpecialties = getSpecialtyFromNode(nodeKey);

    if (nodeKey == "SpeechToText") return sttModelProviders;
    if (nodeKey == "TextToSpeech") return ttsModelProviders;
    if (nodeKey == "Embedding") return embeddingModelProviders;

    // When BYOK is enabled, only show providers that are enabled for this tenant
    // (per the Tenant Admin "Model Providers" section).
    const providers = is_byok_enabled
      ? modelProviders.filter((p) => {
          const config = enabledConfigByProvider[p.value];
          return Boolean(config) && (config?.enabledModelIds?.length ?? 0) > 0;
        })
      : modelProviders.filter((p) => p.isEnabled !== false);

    return providers.map((p) => ({
      ...p,
      models: p.models.filter((m) => {
        const specialtyMatch = requiredSpecialties.every((req) => m.specialty.includes(req));
        return specialtyMatch && m.available;
      }),
    }));
  }, [is_byok_enabled, enabledConfigByProvider, nodeKey]);

  // 4. Initial Load Logic
  useEffect(() => {
    const init = async () => {
      if (is_byok_enabled && credentialsValue && providerValue) {
        try {
          if (nodeKey == "SpeechToText") {
            setByokModels(sttModelProviders[0].models as Model[]);
            setIsInitialized(true);

            return;
          }
          if (nodeKey == "TextToSpeech") {
            setByokModels(ttsModelProviders[0].models as Model[]);
            setIsInitialized(true);

            return;
          }
          if (nodeKey == "Embedding") {
            setByokModels(embeddingModelProviders[0].models as Model[]);
            setIsInitialized(true);

            return;
          }
          setIsLoading(true);

          const provider = PROVIDER_MAP[providerValue];
          if (provider) {
            const res = await getProviderModels(provider, credentialsValue);
            setByokModels((res?.data as Model[]) || []);
          }
        } catch {
          toast.error("Failed to load initial models");
        } finally {
          setIsLoading(false);
        }
      }
      setIsInitialized(true);
    };
    init();
  }, []); // Only on mount

  // 5. Handle Field Resets (BYOK Toggle or Provider Change)
  useEffect(() => {
    if (!isInitialized) return;

    const byokChanged = prevValues.current.is_byok_enabled !== is_byok_enabled;
    const providerChanged = prevValues.current.providerValue !== providerValue;

    if (byokChanged || providerChanged) {
      prevValues.current.is_byok_enabled = is_byok_enabled;
      prevValues.current.providerValue = providerValue;

      setValue(fieldNames.credential_id, "", { shouldDirty: true });
      setValue(fieldNames.model, "", { shouldDirty: true });
      setByokModels([]);
    }
  }, [is_byok_enabled, providerValue, isInitialized, setValue, fieldNames]);

  // 6. Fetch BYOK Models on Credential Change
  useEffect(() => {
    if (!isInitialized || !is_byok_enabled) return;
    if (prevValues.current.credentialsValue === credentialsValue) return;

    prevValues.current.credentialsValue = credentialsValue;
    if (nodeKey == "SpeechToText") {
      setByokModels(sttModelProviders[0].models as Model[]);

      return;
    }
    if (nodeKey == "TextToSpeech") {
      setByokModels(ttsModelProviders[0].models as Model[]);

      return;
    }
    if (nodeKey == "Embedding") {
      setByokModels(embeddingModelProviders[0].models as Model[]);
      return;
    }

    const fetchModels = async () => {
      if (!credentialsValue || !providerValue) {
        setByokModels([]);
        return;
      }

      try {
        setIsLoading(true);
        const provider = PROVIDER_MAP[providerValue];
        if (provider) {
          const res = await getProviderModels(provider, credentialsValue);
          setByokModels((res?.data as Model[]) || []);
          setValue(fieldNames.model, "", { shouldDirty: true });
        }
      } catch {
        toast.error("Error fetching provider models");
        setByokModels([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchModels, 150);
    return () => clearTimeout(timer);
  }, [credentialsValue, providerValue, is_byok_enabled, isInitialized, setValue, fieldNames]);

  // 7. Render Helpers
  const availableModels = useMemo(() => {
    const enabledConfig = enabledConfigByProvider[providerValue];

    // STT / TTS / tenant-config-based providers (e.g. Ollama On-prem) do not fetch
    // models dynamically via a credential, so the model dropdown must show the models
    // that were ENABLED for that provider in the tenant config.
    if (
      is_byok_enabled &&
      (nodeKey == "SpeechToText" ||
        nodeKey == "TextToSpeech" ||
        TENANT_CONFIG_MODEL_PROVIDERS.has(providerValue))
    ) {
      const enabledIds = enabledConfig?.enabledModelIds ?? [];
      return uniqueAndNormalizeArray(
        enabledIds.map((id) => ({ value: id, label: id, available: true } as Model)),
      );
    }

    const models = is_byok_enabled
      ? (() => {
          const enabledIds = new Set(enabledConfig?.enabledModelIds ?? []);
          // Only show models that were enabled for this provider in the tenant config.
          return byokModels.filter((m) => enabledIds.has(m.value));
        })()
      : filteredProviders
          .find((p) => p.value === providerValue)
          ?.models?.filter((m) => m.available) || [];
    return uniqueAndNormalizeArray(models);
  }, [is_byok_enabled, byokModels, filteredProviders, providerValue, enabledConfigByProvider, nodeKey]);

  const currentModel = useMemo(
    () => availableModels.find((m) => m.value === modelField.value),
    [availableModels, modelField.value],
  );

  const currentProviderLabel = filteredProviders.find((p) => p.value === providerValue)?.label;

  return (
    <div className="w-full space-y-3.5">
      <SwitchField
        size="sm"
        name={fieldNames.is_byok_enabled}
        label="Bring your own API key"
        description="Use your own provider API key instead of platform-hosted models."
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
          label={`${currentProviderLabel ?? ""} Credentials`}
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
            disabled={
              !isInitialized ||
              (is_byok_enabled && !TENANT_CONFIG_MODEL_PROVIDERS.has(providerValue) && !credentialsValue)
            }
          />
        </div>

        {enableModelSetup && (
          <Popover>
            <PopoverTrigger className={cn(buttonVariants({ size: "icon8", variant: "outline" }))}>
              <Settings2Icon className="h-3 w-3" />
            </PopoverTrigger>

            <PopoverContent className="mr-6 w-[25rem] space-y-3.5 p-2">
              <Controller
                {...temperatureField}
                render={({ field }) => (
                  <SliderField label="Temperature" name={field.name} min={0} max={1.2} step={0.1} />
                )}
              />

              <Controller
                {...topPField}
                render={({ field }) => (
                  <SliderField label="TopP" name={field.name} min={0} max={1.2} step={0.1} />
                )}
              />

              <SwitchField
                size="sm"
                name={fieldNames.is_json_output}
                label="Is JSON Output"
                description="Output results in JSON format."
              />

              <InputField
                name={fieldNames.max_output_tokens}
                type="number"
                label="Max Output Token"
                fieldSize="sm"
              />
            </PopoverContent>
          </Popover>
        )}
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
