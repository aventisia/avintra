import { InputField, SelectField, SwitchField } from "@aventisia/ui/form";
import {
  Controller,
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import { SliderField } from "@/components/Slider/SliderField";
import { useEffect, useMemo, useState } from "react";
import {
  modelProviders,
  getSpecialtyFromNode,
  Model,
} from "@/features/dynamic-config-panel/constants/model-providers";
import { Popover, PopoverContent, PopoverTrigger } from "@aventisia/ui/popover";
import { Settings2Icon } from "lucide-react";
import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { CredentialsSelectField } from "./CredentialsSelectField";
import { getProviderModels } from "../../apis/llm-pipelines-apis";
import { toast } from "@aventisia/ui/sonner";
import { ModelSelectField } from "./ModelSelectField";

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const ModelConfigField = ({ name }: ModelConfigFieldProps) => {
  const [byokModels, setByokModels] = useState<Model[]>([]);
  const [isLoading, setByokLoading] = useState(false);

  // ---------------- Field names ----------------
  const fieldNames = {
    isByokEnabled: `${name}.isByokEnabled`,
    credentials: `${name}.credentials`,
    provider: `${name}.provider`,
    model: `${name}.model`,
    temperature: `${name}.temperature`,
    topP: `${name}.topP`,
    voice: `${name}.voice`,
    isJsonOutput: `${name}.isJsonOutput`,
    maxOutputToken: `${name}.maxOutputToken`,
  } as const satisfies Record<string, FieldPath<FieldValues>>;

  // ---------------- Form context ----------------
  const { control, setValue } = useFormContext();

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
    name: fieldNames.isByokEnabled,
    control,
  });

  const { field: credentialsField } = useController({
    name: fieldNames.credentials,
    control,
  });

  // ---------------- Derived values ----------------
  const providerValue = providerField.value;
  const isByokEnabled = Boolean(isByokField.value);
  const credentialsValue = credentialsField.value;

  // ---------------- 1. Non-BYOK providers ----------------
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
      }))
      .filter((p) => p.models.length > 0);
  }, [name]);

  // ---------------- 2. RESET on BYOK toggle OR provider change ----------------
  useEffect(() => {
    setValue(fieldNames.credentials, undefined, { shouldDirty: true });
    setValue(fieldNames.model, undefined, { shouldDirty: true });
    
  }, [ providerValue]);

  // ---------------- 3. Fetch BYOK models ----------------
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setByokLoading(true);

        const mapper: Record<string, string> = {
          openai: "OpenAI",
          google: "Gemini",
          openrouter: "OpenRouter",
        };

        const provider = mapper[providerValue];
        if (!provider) {
          setByokModels([]);
          return;
        }

        const models = await getProviderModels(provider, credentialsValue);

        setByokModels(models?.data as Model[]);
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
        return;
      }
      fetchModels();
    }, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [credentialsValue]);

  // ---------------- 4. Available models ----------------
  const availableModels = useMemo(() => {
    if (isByokEnabled) {
      return byokModels;
    }

    const provider = filteredProviders.find((p) => p.value === providerValue);

    return provider?.models ?? [];
  }, [isByokEnabled, byokModels, filteredProviders, providerValue]);

  // ---------------- 5. Current model ----------------
  const currentModel = useMemo(() => {
    if (!modelField.value) return undefined;
    return availableModels.find((m) => m.value === modelField.value);
  }, [availableModels, modelField.value]);

  // ---------------- 6. Current provider ----------------
  const currentProvider = filteredProviders.find(
    (p) => p.value === providerValue,
  );

  // ---------------- Render ----------------
  return (
    <div className="w-full space-y-3.5">
      <SwitchField
        size="sm"
        name={fieldNames.isByokEnabled}
        label="Bring your own API key"
        description="Enable this if you want to use your own LLM provider API key instead of the platform-hosted models."
      />

      <SelectField
        size="sm"
        name={fieldNames.provider}
        selectOptions={filteredProviders}
        label="Model Provider"
      />

      {isByokEnabled && (
        <CredentialsSelectField
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
            size="sm"
            name={fieldNames.model}
            selectOptions={availableModels}
            label="Model"
            isLoading={isLoading}
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
              name={fieldNames.isJsonOutput}
              label="Is JSON Output"
              description="Enable this if you want to output in Json format."
            />

            <InputField
              name={fieldNames.maxOutputToken}
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
