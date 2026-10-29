import { InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { type CrudActionType, type CustomFormMessage } from "@avplatform/ui/types";
import { useFormContext } from "react-hook-form";

import {
  CustomApiToolAuthTypeEnum,
  CustomApiToolVaultCredentialFormValues,
} from "../constants/custom-api-tool-schema";

interface CustomApiToolFormProps {
  rowId: string;
  crudAction: CrudActionType;
  onNameChange?: (value: string) => void;
  availabilityMessage?: CustomFormMessage | null;
}

/**
 * Field-only component for the CustomApiTool vault credential type.
 *
 * It relies on the parent VaultCredentialDynamicForm FormProvider so that all fields
 * share a single form and a single submit handler.
 */
const CustomApiToolForm = ({
  rowId,
  crudAction,
  onNameChange,
  availabilityMessage,
}: CustomApiToolFormProps) => {
  const { watch } = useFormContext<CustomApiToolVaultCredentialFormValues>();
  const isReadOnly = crudAction === "read";
  const authType = watch("authenticationType");

  const authTypeOptions = [
    { label: "API key (header)", value: CustomApiToolAuthTypeEnum.ApiKeyHeader },
    { label: "API key (query)", value: CustomApiToolAuthTypeEnum.ApiKeyQuery },
    { label: "Bearer token", value: CustomApiToolAuthTypeEnum.Bearer },
    { label: "Basic authentication", value: CustomApiToolAuthTypeEnum.Basic },
  ];

  return (
    <div className="space-y-4 px-2.5 pb-5">
      {isReadOnly && <InputField name="id" label="Vault ID" value={rowId} disabled />}

      <InputField
        name="name"
        label="Unique name"
        placeholder="Custom API tool"
        isRequired
        description="Name cannot be modified after creation."
        autoFocus
        disabled={crudAction !== "create"}
        onChangeCapture={(e) => onNameChange?.(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      <TextareaField
        name="description"
        label="Description"
        placeholder="Describe what this credential is for"
      />

      <SelectField
        name="authenticationType"
        label="Authentication type"
        placeholder="Select authentication type"
        selectOptions={authTypeOptions}
        isRequired
      />

      {authType === CustomApiToolAuthTypeEnum.Bearer && (
        <InputField
          name="bearerToken"
          label="Token"
          placeholder="Bearer token"
          type="password"
          isRequired
        />
      )}

      {authType === CustomApiToolAuthTypeEnum.Basic && (
        <>
          <InputField name="basicUsername" label="Username" placeholder="Username" isRequired />
          <InputField
            name="basicPassword"
            label="Password"
            placeholder="Password"
            type="password"
            isRequired
          />
        </>
      )}

      {authType === CustomApiToolAuthTypeEnum.ApiKeyHeader && (
        <>
          <InputField
            name="apiKeyHeaderName"
            label="Header name"
            placeholder="e.g. X-API-key"
            isRequired
          />
          <InputField
            name="apiKeyHeaderValue"
            label="API key"
            placeholder="API key"
            type="password"
            isRequired
          />
        </>
      )}

      {authType === CustomApiToolAuthTypeEnum.ApiKeyQuery && (
        <>
          <InputField
            name="apiKeyQueryName"
            label="Parameter name"
            placeholder="e.g. apiKey"
            isRequired
          />
          <InputField
            name="apiKeyQueryValue"
            label="API key"
            placeholder="API key"
            type="password"
            isRequired
          />
        </>
      )}

      {crudAction !== "create" && (
        <SwitchField
          name="isDisabled"
          label="Disable record"
          description="Disable this record if it's been outdated, or not required anymore"
        />
      )}
    </div>
  );
};

export { CustomApiToolForm };
