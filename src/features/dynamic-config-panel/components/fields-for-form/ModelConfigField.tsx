import { InputField, SelectField, SwitchField } from "@aventisia/ui/form";
import {
  Controller,
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import { SliderField } from "@/components/Slider/SliderField";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

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
  const { control, setValue } = useFormContext();

  const [byokModels, setByokModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ---------------- Field names ----------------
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

  const provider = providerField.value;
  const isByok = Boolean(isByokField.value);
  const credentialId = credentialsField.value;

  // ---------------- Helpers ----------------
  const resetCredentialAndModel = () => {
    setValue(fieldNames.credential_id, isByok ? "" : null, {
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

  // ---------------- Static providers ----------------
  const filteredProviders = useMemo(() => {
    const requiredSpecialties = getSpecialtyFromNode(
      name.replace("__ModelConfig__", ""),
    );

    return modelProviders
      .filter((p) => p.isEnabled !== false)
      .map((p) => ({
        ...p,
        models: p.models.filter(
          (m) =>
            m.available &&
            requiredSpecialties.every((req) => m.specialty.includes(req)),
        ),
      }))
      .filter((p) => p.models.length > 0);
  }, [name]);

  // ---------------- Initialization (saved data) ----------------
  useEffect(() => {
    if (initialized) return;

    if (isByok && provider && credentialId) {
      fetchByokModels(provider, credentialId).finally(() =>
        setInitialized(true),
      );
    } else {
      setInitialized(true);
    }
  }, [initialized, isByok, provider, credentialId]);

  // ---------------- BYOK toggle ----------------
  const prevByok = useRef(isByok);
  useEffect(() => {
    if (!initialized) return;
    if (prevByok.current === isByok) return;

    prevByok.current = isByok;
    resetCredentialAndModel();
  }, [isByok, initialized]);

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
    if (!initialized || !isByok) return;
    if (prevCredential.current === credentialId) return;

    prevCredential.current = credentialId;
    setValue(fieldNames.model, undefined, { shouldDirty: true });

    if (provider && credentialId) {
      fetchByokModels(provider, credentialId);
    } else {
      setByokModels([]);
    }
  }, [credentialId, provider, isByok, initialized]);

  // ---------------- Available models ----------------
  const availableModels = useMemo(() => {
    if (isByok) return byokModels;

    return filteredProviders.find((p) => p.value === provider)?.models ?? [];
  }, [isByok, byokModels, filteredProviders, provider]);

  const currentModel = availableModels.find(
    (m) => m.value === modelField.value,
  );

  const currentProvider = filteredProviders.find((p) => p.value === provider);

  // ---------------- Render ----------------
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

      {isByok && (
        <CredentialsSelectField
          name={fieldNames.credential_id}
          size="sm"
          label={`${currentProvider?.label ?? ""} Credentials`}
          modelProvider={provider}
        />
      )}

      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <SearchableSelectField
            size="sm"
            name={fieldNames.model}
            selectOptions={availableModels}
            label="Model"
            isLoading={isLoading}
            primaryText="Models"
            disabled={!initialized || (isByok && !credentialId)}
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
