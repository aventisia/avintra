import { FormLabelExt, SelectField, SwitchField } from "@aventisia/ui/form";
import {
  Controller,
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import { SliderField } from "@/components/Slider/SliderField";
import { useMemo } from "react";
import {
  aiProviders,
  getSpecialtyFromNode,
} from "@/features/create-model/constants/llm-providers";
import { Popover, PopoverContent, PopoverTrigger } from "@aventisia/ui/popover";
import { Settings2Icon } from "lucide-react";
import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { CredentialsSelectField } from "./CredentialsSelectField";

interface ModelConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const ModelConfigField = ({ name }: ModelConfigFieldProps) => {
  // Set names for the fields
  const isByokEnabledFieldName =
    `${name}.isByokEnabled` as FieldPath<FieldValues>;
  const credentialsFieldName = `${name}.credentials` as FieldPath<FieldValues>;
  const providerFieldName = `${name}.provider` as FieldPath<FieldValues>;
  const modelFieldName = `${name}.model` as FieldPath<FieldValues>;
  const temperatureFieldName = `${name}.temperature` as FieldPath<FieldValues>;
  const topPFieldName = `${name}.topP` as FieldPath<FieldValues>;
  const voiceFieldName = `${name}.voice` as FieldPath<FieldValues>;

  // Get the form context
  const { control } = useFormContext();

  // Use nested field names
  const { field: providerField } = useController({
    name: providerFieldName,
    control,
  });

  const { field: modelField } = useController({
    name: modelFieldName,
    control,
  });

  const { field: temperatureField } = useController({
    name: temperatureFieldName,
    control,
  });

  const { field: topPField } = useController({
    name: topPFieldName,
    control,
  });

  const { field: is_byok_enabled } = useController({
    name: isByokEnabledFieldName,
    control,
  });

  // 1. Get filtered providers based on BYOK and Specialty
  const filteredProviders = useMemo(() => {
    return aiProviders
      .filter((p) => p.isEnabled !== false) // Only enabled providers
      .map((p) => ({
        ...p,
        models: p.models.filter((m) => {
          const specialtyMatch =
            m.specialty ===
            getSpecialtyFromNode(name.replace("__ModelConfig__", ""));
          const availabilityMatch = is_byok_enabled.value ? true : m.available;
          return specialtyMatch && availabilityMatch;
        }),
      }))
      .filter((p) => p.models.length > 0); // Prune empty providers
  }, [is_byok_enabled.value, name]);

  // 2. Get models for the currently selected provider
  const currentProvider = filteredProviders.find(
    (p) => p.value === providerField.value,
  );
  const availableModels = currentProvider?.models || [];

  // 3. Check if the selected model has voices
  const currentModel = availableModels.find(
    (m) => m.value === modelField.value,
  );

  // Render the ModelConfigField component
  return (
    <div className="w-full space-y-3.5">
      {/* BYOK Field */}
      <SwitchField
        size="sm"
        name={isByokEnabledFieldName}
        label="Bring your own API key"
        description="Enable this if you want to use your own LLM provider API key instead of the platform-hosted models."
      />

      {/* Model Provider Field */}
      <SelectField
        size="sm"
        name={providerFieldName}
        selectOptions={filteredProviders}
        label="Model Provider"
      />

      {/* Model field with temperate and topP Popover  */}
      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <SelectField
            size="sm"
            name={modelFieldName}
            selectOptions={availableModels}
            label={`Model`}
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
                <div>
                  <FormLabelExt
                    label="Temperature"
                    description="Controls randomness of responses. Lower values produce more deterministic outputs."
                  />
                  <div className="mt-1 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-lg border p-2.5">
                    <span className="text-sm">0</span>
                    <SliderField
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
                    <span className="text-sm">1.2</span>
                  </div>
                </div>
              )}
            />
            <Controller
              {...topPField}
              render={({ field }) => (
                <div>
                  <FormLabelExt
                    label="Top P"
                    description="Controls diversity via nucleus sampling. Lower values limit the selection to more likely tokens."
                  />
                  <div className="mt-1 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-lg border p-2.5">
                    <span className="text-sm">0</span>
                    <SliderField
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
                    <span className="text-sm">1.2</span>
                  </div>
                </div>
              )}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Voice Field */}
      {currentModel?.voices?.length && (
        <SelectField
          size="sm"
          name={voiceFieldName}
          selectOptions={currentModel.voices}
          label="Voice"
        />
      )}

      {/* Credentials Field */}
      {is_byok_enabled.value && (
        <CredentialsSelectField
          name={credentialsFieldName}
          size="sm"
          label={`${currentProvider?.label} Credentials`}
          modelProvider={providerField.value}
        />
      )}
    </div>
  );
};

ModelConfigField.displayName = "ModelConfigField";

export { ModelConfigField, type ModelConfigFieldProps };
