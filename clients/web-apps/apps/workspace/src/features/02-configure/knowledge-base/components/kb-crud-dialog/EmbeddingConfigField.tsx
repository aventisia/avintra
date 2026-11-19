import { Switch } from "@avplatform/ui";
import { SelectField } from "@avplatform/ui/form";
import { useEffect, useMemo, useRef, useState } from "react";
import { FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";

import { SearchableSelectField } from "@/components/searchable-select/SearchableSelectField";
import { LLModelType } from "@/types";

import { embeddingModelProviders } from "../../constants/embedding-model-providers";
import { VaultCredentialSelectField } from "./VaultCredentialSelectField";

type EmbeddingConfigFieldProps = {
  /** The name of the form field. */
  name: string;
};

const EmbeddingConfigField = ({ name }: EmbeddingConfigFieldProps) => {
  const fieldNames = useMemo(
    () =>
      ({
        credentialName: `${name}.credentialName`,
        provider: `${name}.provider`,
        model: `${name}.model`,
      }) as const satisfies Record<string, FieldPath<FieldValues>>,
    [name],
  );

  const { control, setValue, formState, watch } = useFormContext();

  const { field: providerField } = useController({
    name: fieldNames.provider,
    control,
  });

  const providerValue = providerField.value;

  // IMPORTANT NOTE: the attached credential alone decides BYOK, so a blank or whitespace name is the platform path.
  const credentialName = watch(fieldNames.credentialName);
  const [byokView, setByokView] = useState(false);
  const showByok = byokView || Boolean(String(credentialName ?? "").trim());

  const prevProviderRef = useRef(providerValue);
  const prevCredentialRef = useRef(credentialName);

  useEffect(() => {
    if (prevProviderRef.current === providerValue) return;

    prevProviderRef.current = providerValue;

    if (!formState.isDirty) return;

    setValue(fieldNames.credentialName, "", { shouldDirty: true });
    setValue(fieldNames.model, "", { shouldDirty: true });
  }, [providerValue, setValue, fieldNames.credentialName, fieldNames.model, formState.isDirty]);

  useEffect(() => {
    if (prevCredentialRef.current === credentialName) return;
    prevCredentialRef.current = credentialName;

    if (!showByok) return;
    if (!formState.isDirty) return;

    setValue(fieldNames.model, "", { shouldDirty: true });
  }, [credentialName, showByok, setValue, fieldNames.model, formState.isDirty]);

  const availableModels = useMemo(() => {
    const provider = embeddingModelProviders.find((p) => p.value === providerValue);
    const models = (provider?.models as LLModelType[]) ?? [];

    return models.map((model) => ({
      value: model.value,
      label: model.label ?? model.value,
    }));
  }, [providerValue]);

  const currentProvider = embeddingModelProviders.find((p) => p.value === providerValue);

  return (
    <>
      <div className="flex flex-row items-center justify-between gap-8 rounded-lg border p-2.5 pt-1.5">
        <div className="space-y-0.5">
          <p className="text-xs font-medium leading-none">Bring your own API key</p>
          <p className="text-2xs text-muted-foreground">
            Use your own provider API key instead of the platform-hosted models.
          </p>
        </div>
        <Switch
          size="sm"
          checked={showByok}
          onCheckedChange={(checked) => {
            setByokView(checked);
            setValue(fieldNames.credentialName, "", { shouldDirty: true });
            setValue(fieldNames.model, "", { shouldDirty: true });
          }}
        />
      </div>
      <div className={showByok ? "grid grid-cols-2 gap-3" : undefined}>
        <SelectField
          isRequired
          name={fieldNames.provider}
          selectOptions={embeddingModelProviders.map((provider) => ({
            value: provider.value,
            label: provider.label ?? provider.value,
          }))}
          label="Embedding provider"
        />
        {showByok && (
          <VaultCredentialSelectField
            name={fieldNames.credentialName}
            label="Credential"
            description={`The ${currentProvider?.label ?? ""} credential that holds your API key.`}
            modelProvider={providerValue}
          />
        )}
      </div>
      <SearchableSelectField
        size="base"
        isRequired
        name={fieldNames.model}
        selectOptions={availableModels}
        label="Embedding model"
        primaryText="Models"
        isLoading={false}
        disabled={showByok && !credentialName}
      />
    </>
  );
};

EmbeddingConfigField.displayName = "EmbeddingConfigField";

export { EmbeddingConfigField, type EmbeddingConfigFieldProps };
