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
import { ModelSelectField } from "./ModelSelectField";

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const ModelConfigField = ({ name }: ModelConfigFieldProps) => {
  const [byokModels, setByokModels] = useState<Model[]>([]);
  const [isLoading, setByokLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { setModels } = useModelProviderStore(
    useShallow((state) => ({ setModels: state.setModels })),
  );

  // Field names
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

  // Derived values
  const providerValue = providerField.value;
  const isBYOKEnabled = Boolean(isByokField.value);
  const credentialsValue = credentialsField.value;

  // Track previous values to detect actual changes
  const prevValues = useRef({
    isBYOKEnabled,
    providerValue,
    credentialsValue,
  });

  // 1. Non-BYOK providers
  const filteredProviders = useMemo(() => {
    const task = name as AITask;
    const allowedSpecialties = TASK_SPECIALTY_MAP[task];

    return modelProviders
      .filter((p) => p.isEnabled !== false)
      .map((p) => ({
        ...p,
        models: p.models.filter((m) => {
          const specialtyMatch = allowedSpecialties.every((req) =>
            m.specialty.includes(req),
          );
          return specialtyMatch && m.available;
        }),
      }))
      .filter((p) => p.models.length > 0);
  }, [name]);

  // 2. Initialize on mount (for saved data)
  useEffect(() => {
    const initializeForm = async () => {
      if (!isBYOKEnabled) {
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
    if (prevValues.current.isBYOKEnabled === isBYOKEnabled) return;

    prevValues.current.isBYOKEnabled = isBYOKEnabled;

    // Reset dependent fields
    setValue(fieldNames.credentials, null, { shouldDirty: true });
    setValue(fieldNames.model, "", { shouldDirty: true });
    setByokModels([]);
  }, [isBYOKEnabled, isInitialized, setValue, fieldNames]);

  // 4. Handle provider change (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    if (prevValues.current.providerValue === providerValue) return;

    prevValues.current.providerValue = providerValue;

    // Reset dependent fields
    setValue(fieldNames.credentials, "", { shouldDirty: true });
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
    if (isBYOKEnabled) {
      setModels(byokModels);
      return byokModels;
    }

    const provider = filteredProviders.find((p) => p.value === providerValue);
    setModels(provider?.models ?? []);
    return provider?.models ?? [];
  }, [isBYOKEnabled, filteredProviders, setModels, byokModels, providerValue]);

  // Currently selected model
  const currentModel = useMemo(() => {
    if (!modelField.value) return undefined;
    return availableModels.find((m) => m.value === modelField.value);
  }, [availableModels, modelField.value]);

  // Current provider
  const currentProvider = filteredProviders.find(
    (p) => p.value === providerValue,
  );

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
          modelProvider={
            providerValue === "google" ? "googlegemini" : providerValue
          }
        />
      )}

      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <ModelSelectField
            isRequired
            size="sm"
            name={fieldNames.model}
            selectOptions={availableModels}
            label="Model"
            isLoading={isLoading}
            disabled={!isInitialized || (isBYOKEnabled && !credentialsValue)}
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
