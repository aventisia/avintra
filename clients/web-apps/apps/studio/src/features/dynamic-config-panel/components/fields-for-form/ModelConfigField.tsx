import { Switch } from "@avplatform/ui";
import { ModelCapabilityEnum } from "@avplatform/ui/enums";
import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useEffect, useMemo, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import {
  Model,
  getSpecialtyFromNode,
  isExecutableRealtimeProvider,
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

type ModelConfigFieldProps = {
  /** The name of the form field. */
  name: string;
  /** If true, show the JSON output toggle in the model settings. */
  showJsonOutput?: boolean;
  specialty?: "stt" | "tts";
  hideByok?: boolean;
  /** Hides the voice, language, and speed pickers when the caller renders its own. */
  hideVoiceConfig?: boolean;
  /** Renders the fields without the named group wrapper when the caller provides one. */
  hideGroup?: boolean;
  /** Lays the provider, model, and credential pickers out side by side when the panel is wide. */
  inline?: boolean;
};

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
  azure: "Azure",
  vertex_ai: "VertexAi",
  xai: "Xai",
  bedrock: "Bedrock",
  amazon_nova: "AmazonNova",
};

const ModelConfigField = ({
  name,
  showJsonOutput = true,
  specialty,
  hideByok = false,
  hideVoiceConfig = false,
  hideGroup = false,
  inline = false,
}: ModelConfigFieldProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const { control, setValue, watch } = useFormContext();
  const nodeKey = name.replace("__ModelConfig__", "");

  const isStt = specialty === "stt" || nodeKey === "SpeechToText";
  const isTts = specialty === "tts" || nodeKey === "TextToSpeech";
  const isEmbedding = nodeKey === "Embedding";
  const isRealtime = name === "__ModelConfig__RealtimeVoice";
  const isSpeechSpecialty = specialty === "stt" || specialty === "tts";

  const configCapability = isRealtime
    ? ModelCapabilityEnum.Realtime
    : isStt
      ? ModelCapabilityEnum.Stt
      : isTts
        ? ModelCapabilityEnum.Tts
        : isEmbedding
          ? ModelCapabilityEnum.Embedding
          : ModelCapabilityEnum.Text;

  const fieldNames = useMemo(
    () =>
      ({
        credential_name: `${name}.credential_name`,
        provider: `${name}.provider`,
        model: `${name}.model`,
        voice: `${name}.voice`,
        is_json_output: `${name}.is_json_output`,
        max_output_tokens: `${name}.max_output_tokens`,
        reasoning_effort: `${name}.reasoning_effort`,
      }) as const,
    [name],
  );

  const { field: providerField } = useController({
    name: fieldNames.provider,
    control,
  });
  const { field: modelField } = useController({
    name: fieldNames.model,
    control,
  });

  const providerValue = providerField.value;

  // IMPORTANT NOTE: The BYOK switch only shows or hides the credential picker. A non-blank credential
  // keeps the picker visible so a saved setup reopens in BYOK view, and nodes that hide the switch
  // (voice sub-configs) stay in BYOK view; requests are driven by the credential alone.
  const credentialName = watch(fieldNames.credential_name);
  const [byokView, setByokView] = useState(false);
  const showByok = hideByok || byokView || Boolean(String(credentialName ?? "").trim());

  useEffect(() => {
    setByokView(false);
  }, [name]);

  const {
    data: enabledModelsData,
    isLoading,
    isError,
  } = useFetchTenantEnabledModels(configCapability, showByok);

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

  const prevProvider = useRef(providerValue);

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
    if (!showByok) return true;
    return isProviderEnabled(providerValue);
  }, [showByok, isProviderEnabled, providerValue]);

  const filteredProviders = useMemo(() => {
    const requiredSpecialties = isRealtime
      ? (["realtime"] as const)
      : getSpecialtyFromNode(nodeKey);

    if (isStt || isTts) {
      const speechProviders = isStt ? sttModelProviders : ttsModelProviders;
      if (!showByok) return speechProviders;

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
      if (!showByok) return embeddingModelProviders;
      return embeddingModelProviders.filter((p) => isProviderEnabled(p.value));
    }
    if (isRealtime && showByok) {
      const realtimeProvidersByValue = new Map(modelProviders.map((p) => [p.value, p]));
      return Object.keys(enabledModelIdsByProvider).map(
        (value): LLMProviderType =>
          realtimeProvidersByValue.get(value) ?? {
            value,
            label: PROVIDER_MAP[value] ?? value,
            models: [],
          },
      );
    }

    const providers = showByok
      ? modelProviders.filter((p) => isProviderEnabled(p.value))
      : modelProviders.filter((p) => p.isEnabled !== false);

    const providersWithModels = providers.map((p) => ({
      ...p,
      models: p.models.filter((m) => {
        const specialtyMatch = requiredSpecialties.every((req) => m.specialty.includes(req));
        return specialtyMatch && m.available;
      }),
    }));
    return isRealtime && !showByok
      ? providersWithModels.filter((p) => p.models.length > 0)
      : providersWithModels;
  }, [
    isStt,
    isTts,
    isEmbedding,
    isRealtime,
    showByok,
    enabledModelIdsByProvider,
    isProviderEnabled,
    nodeKey,
  ]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (prevProvider.current === providerValue) return;

    prevProvider.current = providerValue;

    setValue(fieldNames.credential_name, "", { shouldDirty: true });
    setValue(fieldNames.model, "", { shouldDirty: true });
  }, [providerValue, isInitialized, setValue, fieldNames]);

  useEffect(() => {
    if (!isInitialized || !showByok || isLoading || isError) return;
    if (isProviderEnabled(providerValue)) return;
    setValue(fieldNames.provider, "", { shouldDirty: true });
  }, [
    isInitialized,
    showByok,
    isLoading,
    isError,
    isProviderEnabled,
    providerValue,
    setValue,
    fieldNames,
  ]);

  const availableModels = useMemo(() => {
    if (showByok) {
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
  }, [showByok, filteredProviders, providerValue, enabledModelIdsByProvider]);

  const hasEnabledSpeechModels = useMemo(() => {
    if (!isSpeechSpecialty || !showByok) return true;
    return isProviderEnabled(providerValue);
  }, [isSpeechSpecialty, showByok, isProviderEnabled, providerValue]);

  const hasEnabledModelsForSpecialty = useMemo(
    () => Object.keys(enabledModelIdsByProvider).length > 0,
    [enabledModelIdsByProvider],
  );

  const isProviderPickerDisabled =
    showByok && (isLoading || (!isError && !hasEnabledModelsForSpecialty));

  const modelProvidersHref = `${(import.meta.env.VITE_WORKSPACE_PATH ?? "").replace(/\/$/, "")}/tenant/model-providers`;

  const currentModel = useMemo(
    () => availableModels.find((m) => m.value === modelField.value),
    [availableModels, modelField.value],
  );

  const currentProviderLabel = filteredProviders.find((p) => p.value === providerValue)?.label;
  const providerIcon = getProviderBrandIcon(providerValue);
  const basePath = import.meta.env.VITE_STUDIO_PATH?.replace(/\/$/, "") ?? "";

  const modelSelectOptions = useMemo(
    () =>
      inline ? availableModels : availableModels.map((model) => ({ ...model, icon: providerIcon })),
    [availableModels, providerIcon, inline],
  );

  const providerSelectOptions = useMemo(
    () =>
      inline
        ? filteredProviders.map((provider) => ({
            ...provider,
            icon: getProviderBrandIcon(provider.value),
          }))
        : filteredProviders,
    [filteredProviders, inline],
  );

  const modelAdvancedSettings = (
    <>
      {showJsonOutput && (
        <SwitchField
          size="sm"
          name={fieldNames.is_json_output}
          label="Is JSON output"
          description="Output results in JSON format."
        />
      )}

      <InputField
        name={fieldNames.max_output_tokens}
        type="number"
        label="Max output token"
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
        label="Reasoning effort"
        description="Controls how much internal reasoning the model performs before answering. Higher effort can improve accuracy on complex tasks at the cost of speed and tokens. Not supported by all models."
      />
    </>
  );

  const isVoiceLlm = name === "__ModelConfig__Voice";
  const isVoiceRealtime = name === "__ModelConfig__RealtimeVoice";
  const groupName = isStt
    ? "Speech to Text"
    : isTts
      ? "Text to Speech"
      : isVoiceLlm
        ? "LLM"
        : isVoiceRealtime
          ? "Realtime Model"
          : undefined;
  const showInlineVoiceConfig = (isTts || isRealtime) && !hideVoiceConfig;
  const voiceConfigName = isRealtime
    ? "__VoiceConfig__TextToSpeech"
    : name.replace("__ModelConfig__", "__VoiceConfig__");

  const content = (
    <div className="w-full space-y-3.5">
      {!hideByok && (
        <div className="flex flex-row items-center justify-between gap-8 rounded-lg border p-2.5 pt-1.5">
          <div className="space-y-0.5">
            <p className="text-xs font-medium leading-none">Bring your own API key</p>
            <p className="text-2xs text-muted-foreground">
              Use your own provider API key instead of platform-hosted models.
            </p>
          </div>
          <Switch
            size="sm"
            checked={showByok}
            onCheckedChange={(checked) => {
              setByokView(checked);
              setValue(fieldNames.credential_name, "", { shouldDirty: true });
              setValue(fieldNames.model, "", { shouldDirty: true });
            }}
          />
        </div>
      )}

      <div className={inline ? "grid gap-3 lg:grid-cols-2 2xl:grid-cols-3" : "space-y-3.5"}>
        {inline ? (
          <SearchableSelectField
            size="sm"
            name={fieldNames.provider}
            selectOptions={providerSelectOptions}
            label="Provider"
            primaryText="Providers"
            disabled={isProviderPickerDisabled}
          />
        ) : (
          <div className="flex items-end gap-2">
            {providerIcon && (
              <img src={basePath + providerIcon} alt="" className="mb-1 h-5 w-5 shrink-0" />
            )}
            <div className="flex-grow">
              <SelectField
                size="sm"
                name={fieldNames.provider}
                selectOptions={providerSelectOptions}
                label="Model provider"
                disabled={isProviderPickerDisabled}
              />
            </div>
          </div>
        )}

        <SearchableSelectField
          size="sm"
          name={fieldNames.model}
          selectOptions={modelSelectOptions}
          label="Model"
          primaryText="Models"
          placeholder={providerValue ? undefined : "Pick a provider first"}
          isLoading={isLoading}
          disabled={
            !isInitialized || !providerValue || (isSpeechSpecialty && !hasEnabledSpeechModels)
          }
        />

        {showByok && currentProviderHasEnabledModels && (
          <VaultCredentialSelectField
            name={fieldNames.credential_name}
            size="sm"
            className={inline ? "h-8" : undefined}
            label={inline ? "Credential" : `${currentProviderLabel ?? ""} Credentials`}
            modelProvider={providerValue}
            disabled={!modelField.value}
          />
        )}
      </div>

      {showByok && isLoading && (
        <p className="text-xs text-muted-foreground">Loading model providers...</p>
      )}

      {showByok && isError && (
        <p className="text-xs text-destructive">
          Could not load model providers. Please try again.
        </p>
      )}

      {isSpeechSpecialty &&
        showByok &&
        isInitialized &&
        !isLoading &&
        !isError &&
        !hasEnabledModelsForSpecialty && (
          <p className="text-xs text-muted-foreground">
            No {isStt ? "speech-to-text" : "text-to-speech"} models are enabled for this tenant.
            Enable one under{" "}
            <a
              href={modelProvidersHref}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Tenant Admin → Model Providers
            </a>
            .
          </p>
        )}

      {isRealtime &&
        showByok &&
        isInitialized &&
        !isLoading &&
        !isError &&
        !hasEnabledModelsForSpecialty && (
          <p className="text-xs text-muted-foreground">
            No realtime models are enabled for this tenant. Enable one under{" "}
            <a
              href={modelProvidersHref}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Tenant Admin → Model Providers
            </a>
            .
          </p>
        )}

      {isRealtime &&
        showByok &&
        isInitialized &&
        !!providerValue &&
        !isExecutableRealtimeProvider(providerValue) && (
          <p className="text-xs text-destructive">
            {`${currentProviderLabel ?? providerValue} is not supported for realtime voice. Select a supported realtime provider before publishing.`}
          </p>
        )}

      {enableModelSetup && <div className="space-y-3.5">{modelAdvancedSettings}</div>}

      {!hideVoiceConfig && currentModel?.voices?.length ? (
        <SelectField
          size="sm"
          name={fieldNames.voice}
          selectOptions={currentModel.voices}
          label="Voice"
        />
      ) : null}

      {showInlineVoiceConfig && (
        <VoiceConfigField
          name={voiceConfigName}
          providerPath={fieldNames.provider}
          modelPath={fieldNames.model}
          credentialPath={fieldNames.credential_name}
          capability={isRealtime ? "realtime" : "tts"}
        />
      )}
    </div>
  );

  return groupName && !hideGroup ? (
    <GroupedFieldsWrapper groupName={groupName}>{content}</GroupedFieldsWrapper>
  ) : (
    content
  );
};

ModelConfigField.displayName = "ModelConfigField";

export { ModelConfigField, type ModelConfigFieldProps };
