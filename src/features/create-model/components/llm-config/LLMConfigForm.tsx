import {
  Form,
  FormLabelExt,
  SelectField,
  SwitchField,
} from "@aventisia/ui/form";
import { z } from "zod";
import { SubmitButton } from "@aventisia/ui/buttons";
import { Controller } from "react-hook-form";
import { useDefineLLMConfigForm } from "../../hooks/useDefineLLMConfigForm";
import { llmConfigZodSchema } from "../../constants/llm-config-zod-schema";
import { SliderField } from "@/components/Slider/SliderField";
import {
  llmProviderProps,
  hasApiKeyProps,
  modelProps,
} from "../../constants/llm-config-field-props";
import { CredentialsSelectField } from "@/features/dynamic-config-panel/components/fields-for-form/CredentialsSelectField";

export const LLMConfigForm = () => {
  // Define form
  const {
    form,
    isDirty,
    isSubmitting,
    visibleModels,
    visibleProviders,
    hasOwnApiKey,
  } = useDefineLLMConfigForm();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof llmConfigZodSchema>) => {
    console.log(formData);
  };
  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 p-2"
      checkDirtyForm={false}
    >
      <SwitchField {...hasApiKeyProps} />

      {hasOwnApiKey && (
        <CredentialsSelectField name="" size="base" label="Credentials" />
      )}
      <SelectField {...llmProviderProps} selectOptions={visibleProviders} />
      <SelectField {...modelProps} selectOptions={visibleModels} />

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
        name="topP"
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

      <div className="mt-3 flex w-full items-center justify-end">
        <SubmitButton
          size="xs"
          disabled={!isDirty}
          isPending={isSubmitting}
          primaryText="Save"
        />
      </div>
    </Form>
  );
};
