import { InputField, SelectField, SwitchField } from "@aventisia/ui/form";
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
  modelProviders,
  getSpecialtyFromNode,
} from "@/features/dynamic-config-panel/constants/model-providers";
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
  const isJsonOutputFieldName =
    `${name}.isJsonOutput` as FieldPath<FieldValues>;
  const maxOutputTokenFieldName =
    `${name}.maxOutputToken` as FieldPath<FieldValues>;

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
  // 1. Get filtered providers based on BYOK and Node specialty
  const filteredProviders = useMemo(() => {
    const requiredSpecialties = getSpecialtyFromNode(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name.replace("__ModelConfig__", "") as any,
    );

    return modelProviders
      .filter((p) => p.isEnabled !== false)
      .map((p) => ({
        ...p,
        models: p.models.filter((m) => {
          const specialtyMatch = requiredSpecialties.every((req) =>
            m.specialty.includes(req),
          );

          const availabilityMatch = is_byok_enabled.value ? true : m.available;

          return specialtyMatch && availabilityMatch;
        }),
      }))
      .filter((p) => p.models.length > 0);
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
            {/* JSONOutput Field */}
            <SwitchField
              size="sm"
              name={isJsonOutputFieldName}
              label="Is JSON Output"
              description="Enable this if you want to output in Json format."
            />

            <InputField
              name={maxOutputTokenFieldName}
              type="number"
              label="Max Output Token"
              fieldSize="sm"
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
          label={`${currentProvider?.label ? currentProvider?.label : ""} Credentials`}
          modelProvider={
            providerField.value == "google"
              ? "googlegemini"
              : providerField.value
          }
        />
      )}
    </div>
  );
};

ModelConfigField.displayName = "ModelConfigField";

export { ModelConfigField, type ModelConfigFieldProps };
