import { ModelCapabilityEnum } from "@avplatform/ui/enums";
import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useController, useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import {
  Model,
  getSpecialtyFromNode,
  modelProviders,
} from "@/features/dynamic-config-panel/constants/model-providers";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";
import { getProviderBrandIcon } from "@/utils/provider-brand-icons.util";

import { embeddingModelProviders } from "../../constants/embedding-model-providers";
import { sttModelProviders } from "../../constants/stt-model-provider";
import { ttsModelProviders } from "../../constants/tts-model-provider";
import { useFetchTenantEnabledModels } from "../../hooks/useFetchTenantEnabledModels.hook";
import { LLMProviderType } from "../../types/llm-provider.type";
import { createHasEnabledModels } from "../../utils/hasEnabledModels.util";
import { uniqueAndNormalizeArray } from "../../utils/uniqueAndNormalizeArray";
import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";
import { VaultCredentialSelectField } from "./VaultCredentialSelectField";
import { VoiceConfigField } from "./VoiceConfigField";

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
  /** If true, show the JSON output toggle in the model settings. */
  showJsonOutput?: boolean;
  specialty?: "stt" | "tts";
  hideByok?: boolean;
}

const PROVIDER_MAP: Record<string, string> = {
  openai: "OpenAI",
  googlegemini: "Gemini",
  openrouter: "OpenRouter",
  anthropic: "Anthropic",
  elevenlabs: "ElevenLabs",
  ollama: "Ollama",
  ollamacloud: "OllamaCloud",
  groq: "Groq",
  mistral: "Mistral",
};

const ModelConfigField = ({
  name,
  showJsonOutput = true,
  specialty,
  hideByok = false,
}: ModelConfigFieldProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const { control, setValue, watch } = useFormContext();
  const nodeKey = name.replace("__ModelConfig__", "");

  const isStt = specialty === "stt" || nodeKey === "SpeechToText";
  const isTts = specialty === "tts" || nodeKey === "TextToSpeech";
  const isEmbedding = nodeKey === "Embedding";
  const isSpeechSpecialty = specialty === "stt" || specialty === "tts";

  const configCapability = isStt
    ? ModelCapabilityEnum.Stt
    : isTts
      ? ModelCapabilityEnum.Tts
      : isEmbedding
        ? ModelCapabilityEnum.Embedding
        : ModelCapabilityEnum.Text;

  const fieldNames = useMemo(
    () =>
      ({
        is_byok_enabled: `${name}.is_byok_enabled`,
        credential_name: `${name}.credential_name`,
        provider: `${name}.provider`,
        model: `${name}.model`,
        voice: `${name}.voice`,
        temperature: `${name}.temperature`,
        top_p: `${name}.top_p`,
        is_json_output: `${name}.is_json_output`,
        max_output_tokens: `${name}.max_output_tokens`,
        reasoning_effort: `${name}.reasoning_effort`,
      }) as const,
    [name],
  );

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

  const {
    data: enabledModelsData,
    isLoading,
    isError,
  } = useFetchTenantEnabledModels(configCapability, is_byok_enabled);

  const enabledModelIdsByProvider = useMemo(() => {
    const idsByBackendType: Record<string, string[]> = {};
    for (const model of enabledModelsData?.data ?? []) {
      (idsByBackendType[model.providerType] ??= []).push(model.modelId);
    }

    const idsByStudioProvider: Record<string, string[]> = {};
    for (const [studioValue, backendType] of Object.entries(PROVIDER_MAP)) {
      const ids = idsByBackendType[backendType];
      if (ids?.length) idsByStudioProvider[studioValue] = ids;
    }
    return idsByStudioProvider;
  }, [enabledModelsData]);

  const isProviderEnabled = useMemo(
    () => createHasEnabledModels(enabledModelIdsByProvider),
    [enabledModelIdsByProvider],
  );

  const prevValues = useRef({
    is_byok_enabled,
    providerValue,
  });

  const enableModelSetup = useMemo(
    () => ["__ModelConfig__Inferencing", "__ModelConfig__Conversation"].includes(name),
    [name],
  );

  // IMPORTANT NOTE: Reasoning effort has no explicit "unset" state, so ChatAgent nodes that stored a
  // null/empty value or pre-date the field fall back to the default "medium". Scoped to the
  // conversation model so other model configs are untouched.
  const reasoningEffortValue = watch(fieldNames.reasoning_effort);
  useEffect(() => {
    if (name !== "__ModelConfig__Conversation") return;
    if (reasoningEffortValue == null || reasoningEffortValue === "") {
      setValue(fieldNames.reasoning_effort, "medium", { shouldDirty: false });
    }
  }, [name, reasoningEffortValue, setValue, fieldNames]);

  const currentProviderHasEnabledModels = useMemo(() => {
    if (!is_byok_enabled) return true;
    return isProviderEnabled(providerValue);
  }, [is_byok_enabled, isProviderEnabled, providerValue]);

  const filteredProviders = useMemo(() => {
    const requiredSpecialties = getSpecialtyFromNode(nodeKey);

    if (isStt || isTts) {
      const speechProviders = isStt ? sttModelProviders : ttsModelProviders;
      if (!is_byok_enabled) return speechProviders;

      const speechProvidersByValue = new Map(speechProviders.map((p) => [p.value, p]));
      return Object.keys(enabledModelIdsByProvider).map(
        (value): LLMProviderType =>
          speechProvidersByValue.get(value) ?? {
            value,
            label: PROVIDER_MAP[value] ?? value,
            models: [],
          },
      );
    }
    if (isEmbedding) {
      if (!is_byok_enabled) return embeddingModelProviders;
      return embeddingModelProviders.filter((p) => isProviderEnabled(p.value));
    }

    const providers = is_byok_enabled
      ? modelProviders.filter((p) => isProviderEnabled(p.value))
      : modelProviders.filter((p) => p.isEnabled !== false);

    return providers.map((p) => ({
      ...p,
      models: p.models.filter((m) => {
        const specialtyMatch = requiredSpecialties.every((req) => m.specialty.includes(req));
        return specialtyMatch && m.available;
      }),
    }));
  }, [
    isStt,
    isTts,
    isEmbedding,
    is_byok_enabled,
    enabledModelIdsByProvider,
    isProviderEnabled,
    nodeKey,
  ]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const byokChanged = prevValues.current.is_byok_enabled !== is_byok_enabled;
    const providerChanged = prevValues.current.providerValue !== providerValue;

    if (byokChanged || providerChanged) {
      prevValues.current.is_byok_enabled = is_byok_enabled;
      prevValues.current.providerValue = providerValue;

      setValue(fieldNames.credential_name, "", { shouldDirty: true });
      setValue(fieldNames.model, "", { shouldDirty: true });
    }
  }, [is_byok_enabled, providerValue, isInitialized, setValue, fieldNames]);

  useEffect(() => {
    if (!isInitialized || !is_byok_enabled || isLoading || isError) return;
    if (isProviderEnabled(providerValue)) return;
    setValue(fieldNames.provider, "", { shouldDirty: true });
  }, [
    isInitialized,
    is_byok_enabled,
    isLoading,
    isError,
    isProviderEnabled,
    providerValue,
    setValue,
    fieldNames,
  ]);

  const availableModels = useMemo(() => {
    if (is_byok_enabled) {
      const enabledIds = enabledModelIdsByProvider[providerValue] ?? [];
      return uniqueAndNormalizeArray(
        enabledIds.map((id) => ({ value: id, label: id, available: true }) as Model),
      );
    }

    return uniqueAndNormalizeArray(
      filteredProviders
        .find((p) => p.value === providerValue)
        ?.models?.filter((m) => m.available) || [],
    );
  }, [is_byok_enabled, filteredProviders, providerValue, enabledModelIdsByProvider]);

  const hasEnabledSpeechModels = useMemo(() => {
    if (!isSpeechSpecialty || !is_byok_enabled) return true;
    return isProviderEnabled(providerValue);
  }, [isSpeechSpecialty, is_byok_enabled, isProviderEnabled, providerValue]);

  const hasEnabledModelsForSpecialty = useMemo(
    () => Object.keys(enabledModelIdsByProvider).length > 0,
    [enabledModelIdsByProvider],
  );

  const currentModel = useMemo(
    () => availableModels.find((m) => m.value === modelField.value),
    [availableModels, modelField.value],
  );

  const currentProviderLabel = filteredProviders.find((p) => p.value === providerValue)?.label;
  const providerIcon = getProviderBrandIcon(providerValue);
  const basePath = import.meta.env.VITE_STUDIO_PATH?.replace(/\/$/, "") ?? "";

  const modelSelectOptions = useMemo(
    () => availableModels.map((model) => ({ ...model, icon: providerIcon })),
    [availableModels, providerIcon],
  );

  const modelAdvancedSettings = (
    <>
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

      {showJsonOutput && (
        <SwitchField
          size="sm"
          name={fieldNames.is_json_output}
          label="Is JSON Output"
          description="Output results in JSON format."
        />
      )}

      <InputField
        name={fieldNames.max_output_tokens}
        type="number"
        label="Max Output Token"
        fieldSize="sm"
        description="Maximum number of tokens the model may generate in its reply. Leave empty to use the model default; values must be greater than 0 (0 is invalid)."
      />

      <SelectField
        size="sm"
        name={fieldNames.reasoning_effort}
        selectOptions={[
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ]}
        label="Reasoning Effort"
        description="Controls how much internal reasoning the model performs before answering. Higher effort can improve accuracy on complex tasks at the cost of speed and tokens. Not supported by all models."
      />
    </>
  );

  const groupName = isStt ? "Speech to Text" : isTts ? "Text to Speech" : undefined;
  const showInlineVoiceConfig = isTts;
  const voiceConfigName = name.replace("__ModelConfig__", "__VoiceConfig__");

  const content = (
    <div className="w-full space-y-3.5">
      {!hideByok && (
        <SwitchField
          size="sm"
          name={fieldNames.is_byok_enabled}
          label="Bring your own API key"
          description="Use your own provider API key instead of platform-hosted models."
        />
      )}

      <div className="flex items-end gap-2">
        {providerIcon && (
          <img src={basePath + providerIcon} alt="" className="mb-1 h-5 w-5 shrink-0" />
        )}
        <div className="flex-grow">
          <SelectField
            size="sm"
            name={fieldNames.provider}
            selectOptions={filteredProviders}
            label="Model Provider"
            disabled={is_byok_enabled && isLoading}
          />
        </div>
      </div>

      {is_byok_enabled && isLoading && (
        <p className="text-xs text-muted-foreground">Loading model providers...</p>
      )}

      {is_byok_enabled && isError && (
        <p className="text-xs text-destructive">
          Could not load model providers. Please try again.
        </p>
      )}

      <SearchableSelectField
        size="sm"
        name={fieldNames.model}
        selectOptions={modelSelectOptions}
        label="Model"
        primaryText="Models"
        isLoading={isLoading}
        disabled={
          !isInitialized || !providerValue || (isSpeechSpecialty && !hasEnabledSpeechModels)
        }
      />

      {is_byok_enabled && currentProviderHasEnabledModels && (
        <VaultCredentialSelectField
          name={fieldNames.credential_name}
          size="sm"
          label={`${currentProviderLabel ?? ""} Credentials`}
          modelProvider={providerValue}
          disabled={!modelField.value}
        />
      )}

      {isSpeechSpecialty &&
        is_byok_enabled &&
        isInitialized &&
        !isLoading &&
        !isError &&
        !hasEnabledModelsForSpecialty && (
          <p className="text-xs text-muted-foreground">
            No {isStt ? "speech-to-text" : "text-to-speech"} models are enabled for this tenant.
            Enable one under Tenant Admin &gt; Model Providers.
          </p>
        )}

      {enableModelSetup && <div className="space-y-3.5">{modelAdvancedSettings}</div>}

      {currentModel?.voices?.length ? (
        <SelectField
          size="sm"
          name={fieldNames.voice}
          selectOptions={currentModel.voices}
          label="Voice"
        />
      ) : null}

      {showInlineVoiceConfig && (
        <VoiceConfigField name={voiceConfigName} providerPath={fieldNames.provider} />
      )}
    </div>
  );

  return groupName ? (
    <GroupedFieldsWrapper groupName={groupName}>{content}</GroupedFieldsWrapper>
  ) : (
    content
  );
};

ModelConfigField.displayName = "ModelConfigField";

export { ModelConfigField, type ModelConfigFieldProps };
