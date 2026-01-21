import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";
import { SliderField } from "@/shared/Slider/SliderField";

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
import { useShallow } from "zustand/react/shallow";

import { getProviderModels } from "../apis/llm-model-apis";
import {
  AITask,
  Model,
  TASK_SPECIALTY_MAP,
  modelProviders,
} from "../constants/model-providers";
import { useModelProviderStore } from "../stores/model-provider-store";
import { CredentialsSelectField } from "./CredentialsSelectField";

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const PROVIDER_API_MAP: Record<string, string> = {
  openai: "OpenAI",
  googlegemini: "Gemini",
  openrouter: "OpenRouter",
};

const ModelConfigField = ({ name }: ModelConfigFieldProps) => {
  const [byokModels, setByokModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { setModels } = useModelProviderStore(
    useShallow((s) => ({ setModels: s.setModels })),
  );

  const { control, setValue } = useFormContext();

  // ---------------- Field names ----------------
  const fieldNames = {
    isBYOKEnabled: `${name}.isBYOKEnabled`,
    credentials: `${name}.credentialId`,
    provider: `${name}.provider`,
    model: `${name}.model`,
    temperature: `${name}.temperature`,
    topP: `${name}.topP`,
    voice: `${name}.voice`,
    isJsonOutput: `${name}.isJsonOutput`,
    maxOutputToken: `${name}.maxOutputToken`,
  } as const satisfies Record<string, FieldPath<FieldValues>>;

  // ---------------- Controllers ----------------
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
    name: fieldNames.topP,
    control,
  });

  const { field: isByokField } = useController({
    name: fieldNames.isBYOKEnabled,
    control,
  });

  const { field: credentialsField } = useController({
    name: fieldNames.credentials,
    control,
  });
  const { field: maxOutputTokenField } = useController({
    name: fieldNames.maxOutputToken,
    control,
  });

  const provider = providerField.value;
  const isBYOKEnabled = Boolean(isByokField.value);
  const credentialId = credentialsField.value;

  // ---------------- Helpers ----------------
  const resetCredentialAndModel = () => {
    setValue(fieldNames.credentials, isBYOKEnabled ? "" : null, {
      shouldDirty: true,
    });
    setValue(fieldNames.model, "", { shouldDirty: true });
    setByokModels([]);
  };

  const fetchByokModels = async (providerValue: string, credId: string) => {
    const apiProvider = PROVIDER_API_MAP[providerValue];
    if (!apiProvider || !credId) {
      setByokModels([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await getProviderModels(apiProvider, credId);
      setByokModels(res?.data as Model[]);
    } catch (e) {
      toast.error(e as string);
      setByokModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Providers ----------------
  const filteredProviders = useMemo(() => {
    const task = name as AITask;
    const allowed = TASK_SPECIALTY_MAP[task];

    return modelProviders
      .filter((p) => p.isEnabled !== false)
      .map((p) => ({
        ...p,
        models: p.models.filter(
          (m) =>
            m.available && allowed.every((req) => m.specialty.includes(req)),
        ),
      }))
      .filter((p) => p.models.length > 0);
  }, [name]);

  // ---------------- Initialization ----------------
  useEffect(() => {
    if (initialized) return;

    if (isBYOKEnabled && provider && credentialId) {
      fetchByokModels(provider, credentialId).finally(() =>
        setInitialized(true),
      );
    } else {
      setInitialized(true);
    }
  }, [initialized, isBYOKEnabled, provider, credentialId]);

  // ---------------- BYOK toggle ----------------
  const prevByok = useRef(isBYOKEnabled);
  useEffect(() => {
    if (!initialized) return;
    if (prevByok.current === isBYOKEnabled) return;

    prevByok.current = isBYOKEnabled;
    resetCredentialAndModel();
  }, [isBYOKEnabled, initialized]);

  // ---------------- Provider change ----------------
  const prevProvider = useRef(provider);
  useEffect(() => {
    if (!initialized) return;
    if (prevProvider.current === provider) return;

    prevProvider.current = provider;
    resetCredentialAndModel();
  }, [provider, initialized]);

  // ---------------- Credential change ----------------
  const prevCredential = useRef(credentialId);
  useEffect(() => {
    if (!initialized || !isBYOKEnabled) return;
    if (prevCredential.current === credentialId) return;

    prevCredential.current = credentialId;
    setValue(fieldNames.model, undefined, { shouldDirty: true });

    if (provider && credentialId) {
      fetchByokModels(provider, credentialId);
    } else {
      setByokModels([]);
    }
  }, [credentialId, provider, isBYOKEnabled, initialized]);

  // ---------------- Available models ----------------
  const availableModels = useMemo(() => {
    if (isBYOKEnabled) return byokModels;

    return filteredProviders.find((p) => p.value === provider)?.models ?? [];
  }, [isBYOKEnabled, byokModels, filteredProviders, provider]);

  // sync with store (SIDE EFFECT)
  useEffect(() => {
    setModels(availableModels);
  }, [availableModels, setModels]);

  const currentModel = availableModels.find(
    (m) => m.value === modelField.value,
  );

  const currentProvider = filteredProviders.find((p) => p.value === provider);

  // ---------------- Render ----------------
  return (
    <div className="w-full space-y-3.5">
      {/* BYOK Field */}
      <div className="bg-background rounded-lg">
        <SwitchField
          size="sm"
          name={fieldNames.isBYOKEnabled}
          label="Bring your own API key"
          description="Enable this if you want to use your own LLM provider API key instead of the platform-hosted models."
        />
      </div>
      <SelectField
        isRequired
        size="sm"
        name={fieldNames.provider}
        selectOptions={filteredProviders}
        label="Model Provider"
      />

      {isBYOKEnabled && (
        <CredentialsSelectField
          isRequired
          name={fieldNames.credentials}
          size="sm"
          label={`${currentProvider?.label ?? ""} Credentials`}
          modelProvider={provider}
        />
      )}

      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <SearchableSelectField
            isRequired
            size="sm"
            name={fieldNames.model}
            selectOptions={availableModels}
            label="Model"
            isLoading={isLoading}
            primaryText="Models"
            disabled={!initialized || (isBYOKEnabled && !credentialId)}
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

          <PopoverContent className="mr-10 w-[25rem] space-y-3.5 p-2">
            <Controller
              {...temperatureField}
              render={({ field }) => (
                <SliderField
                  label="Temperature"
                  name={field.name}
                  value={[field.value ?? 0.6]}
                  onValueChange={(val) => field.onChange(val[0])}
                  onValueCommit={field.onBlur}
                  trackColor="bg-muted"
                  min={0}
                  max={1.2}
                  step={0.1}
                  className="resize-none text-sm"
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
                  trackColor="bg-muted"
                  min={0}
                  max={1.2}
                  step={0.1}
                  className="resize-none text-sm"
                />
              )}
            />

            <SwitchField
              size="sm"
              name={fieldNames.isJsonOutput}
              label="Is JSON Output"
              description="Enable this if you want to output in Json format."
            />

            <InputField
              name={fieldNames.maxOutputToken}
              type="number"
              onChange={(v) =>
                maxOutputTokenField.onChange(parseInt(v.currentTarget.value))
              }
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
