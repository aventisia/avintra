import { FormLabelExt, SelectField, SwitchField } from "@aventisia/ui/form";
import { TabsContent } from "@aventisia/ui/tabs";
import {
  hasApiKeyProps,
  llmProviderProps,
  modelProps,
} from "../../constants/llm-config-field-props";
import { CredentialsSelectField } from "@/features/dynamic-config-panel/components/fields-for-form/CredentialsSelectField";
import { Controller, UseFormReturn } from "react-hook-form";
import { SliderField } from "@/components/Slider/SliderField";
import { z } from "zod";
import { llmConfigZodSchema } from "../../constants/llm-config-zod-schema";
import { useMemo } from "react";
import { Model, providersData } from "../../constants/llm-providers";

const ModelFormContent = ({
  form,
}: {
  form: UseFormReturn<z.infer<typeof llmConfigZodSchema>>;
}) => {
  // Text model
  const specialty = "text";

  const is_byok_enabled = form.watch("is_byok_enabled");
  const provider = form.watch("provider");

  // Function for filtering models based on availability and specialty
  const filterModels = (
    models: Model[],
    is_byok_enabled: boolean,
    specialty: string,
  ) => {
    return models.filter((m) => {
      if (is_byok_enabled) {
        // If BYOK is true, show all available models
        return m.specialty === specialty;
      }
      // If BYOK is false, filter based on availability and specialty
      return m.available && m.specialty === specialty;
    });
  };

  // Filter providers based on BYOK and whether they have at least one available model
  const visibleProviders = useMemo(() => {
    return providersData
      .filter((p) => p.isEnabled) // Only include enabled providers
      .filter((p) => {
        if (is_byok_enabled) {
          return true; // Show all enabled providers if BYOK is enabled
        } else {
          // If BYOK is false, show only providers with at least one available model
          return p.models.some((m) => m.available);
        }
      });
  }, [is_byok_enabled]);

  // Filter models based on selected provider, BYOK status, and specialty
  const visibleModels = useMemo(() => {
    // Find the selected provider
    const selectedProvider = providersData.find((p) => p.value === provider);
    if (!selectedProvider) return [];

    // Filter models based on the current specialty and BYOK status
    return filterModels(selectedProvider.models, is_byok_enabled, specialty);
  }, [provider, is_byok_enabled]);

  return (
    <TabsContent className="space-y-4 px-1 py-2" value="Model">
      <SwitchField size="sm" {...hasApiKeyProps} />

      {is_byok_enabled && (
        <CredentialsSelectField name="" size="sm" label="Credentials" />
      )}
      <SelectField
        size="sm"
        {...llmProviderProps}
        selectOptions={visibleProviders}
      />
      <SelectField size="sm" {...modelProps} selectOptions={visibleModels} />

      <Controller
        control={form.control}
        name="temperature"
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
        control={form.control}
        name="top_p"
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
    </TabsContent>
  );
};

export default ModelFormContent;
