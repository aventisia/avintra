import { SelectField, SwitchField } from "@avplatform/ui/form";
import { useEffect, useMemo, useRef } from "react";
import { FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";

import { SearchableSelectField } from "@/components/searchable-select/SearchableSelectField";
import { LLModelType } from "@/types";

import { embeddingModelProviders } from "../../constants/embedding-model-providers";
import { VaultCredentialSelectField } from "./VaultCredentialSelectField";

interface EmbeddingConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const EmbeddingConfigField = ({ name }: EmbeddingConfigFieldProps) => {
  // Field names
  const fieldNames = useMemo(
    () =>
      ({
        isByokEnabled: `${name}.isByokEnabled`,
        credentialName: `${name}.credentialName`,
        provider: `${name}.provider`,
        model: `${name}.model`,
      }) as const satisfies Record<string, FieldPath<FieldValues>>,
    [name],
  );

  // Form context
  const { control, setValue, formState } = useFormContext();

  // Controllers
  const { field: providerField } = useController({
    name: fieldNames.provider,
    control,
  });

  const { field: isByokField } = useController({
    name: fieldNames.isByokEnabled,
    control,
  });

  const { field: credentialsField } = useController({
    name: fieldNames.credentialName,
    control,
  });

  // Derived values
  const providerValue = providerField.value;
  const isByokEnabled = Boolean(isByokField.value);
  const credentialsValue = credentialsField.value;

  const prevProviderRef = useRef(providerValue);
  const prevByokEnabledRef = useRef(isByokEnabled);
  const prevCredentialRef = useRef(credentialsValue);

  // Reset dependent fields when provider mode/provider changes after user interaction.
  useEffect(() => {
    const hasProviderOrModeChanged =
      prevProviderRef.current !== providerValue || prevByokEnabledRef.current !== isByokEnabled;

    if (!hasProviderOrModeChanged) return;

    prevProviderRef.current = providerValue;
    prevByokEnabledRef.current = isByokEnabled;

    if (!formState.isDirty) return;

    setValue(fieldNames.credentialName, "", { shouldDirty: true });
    setValue(fieldNames.model, "", { shouldDirty: true });
  }, [
    isByokEnabled,
    providerValue,
    setValue,
    fieldNames.credentialName,
    fieldNames.model,
    formState.isDirty,
  ]);

  // Reset model when credential changes in BYOK mode after user interaction.
  useEffect(() => {
    if (prevCredentialRef.current === credentialsValue) return;
    prevCredentialRef.current = credentialsValue;

    if (!isByokEnabled) return;
    if (!formState.isDirty) return;

    setValue(fieldNames.model, "", { shouldDirty: true });
  }, [credentialsValue, isByokEnabled, setValue, fieldNames.model, formState.isDirty]);

  // Available models
  const availableModels = useMemo(() => {
    const provider = embeddingModelProviders.find((p) => p.value === providerValue);
    const models = (provider?.models as LLModelType[]) ?? [];

    return models.map((model) => ({
      value: model.value,
      label: model.label ?? model.value,
    }));
  }, [providerValue]);

  // Current provider
  const currentProvider = embeddingModelProviders.find((p) => p.value === providerValue);

  // Render component
  return (
    <div className="w-full space-y-3.5">
      <SwitchField
        size="sm"
        name={fieldNames.isByokEnabled}
        label="Bring your own API key"
        description="Enable this if you want to use your own provider API key instead of the platform-hosted models."
      />

      <SelectField
        size="base"
        isRequired
        name={fieldNames.provider}
        selectOptions={embeddingModelProviders.map((provider) => ({
          value: provider.value,
          label: provider.label ?? provider.value,
        }))}
        label=" Provider"
      />

      {isByokEnabled && (
        <VaultCredentialSelectField
          isRequired
          name={fieldNames.credentialName}
          size="base"
          label={`${currentProvider?.label ?? ""} Credentials`}
          modelProvider={providerValue}
        />
      )}

      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <SearchableSelectField
            size="base"
            isRequired
            name={fieldNames.model}
            selectOptions={availableModels}
            label="Embedding model"
            primaryText="Models"
            isLoading={false}
            disabled={isByokEnabled && !credentialsValue}
          />
        </div>
      </div>
    </div>
  );
};

EmbeddingConfigField.displayName = "EmbeddingConfigField";

export { EmbeddingConfigField, type EmbeddingConfigFieldProps };
