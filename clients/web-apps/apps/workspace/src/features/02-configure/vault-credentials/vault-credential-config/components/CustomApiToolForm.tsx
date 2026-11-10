import { InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { type CrudActionType, type CustomFormMessage } from "@avplatform/ui/types";
import { useFormContext } from "react-hook-form";

import {
  AUTH_TYPE_OPTIONS,
  CustomApiToolAuthTypeEnum,
  CustomApiToolVaultCredentialFormValues,
} from "../constants/custom-api-tool-schema.constant";

interface CustomApiToolFormProps {
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
  crudAction,
  onNameChange,
  availabilityMessage,
}: CustomApiToolFormProps) => {
  const { watch } = useFormContext<CustomApiToolVaultCredentialFormValues>();
  const authType = watch("authenticationType");

  return (
    <>
      <InputField
        name="name"
        label="Unique name"
        placeholder="e.g. crm-api"
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
        placeholder="What is this credential for?"
      />

      <SelectField
        name="authenticationType"
        label="Authentication type"
        placeholder="Select authentication type"
        selectOptions={AUTH_TYPE_OPTIONS}
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
        <div className="grid grid-cols-2 gap-3">
          <InputField
            name="basicUsername"
            label="Username"
            placeholder="e.g. api-user"
            isRequired
          />
          <InputField
            name="basicPassword"
            label="Password"
            placeholder="Password"
            type="password"
            isRequired
          />
        </div>
      )}

      {authType === CustomApiToolAuthTypeEnum.ApiKeyHeader && (
        <div className="grid grid-cols-2 gap-3">
          <InputField
            name="apiKeyHeaderName"
            label="Header name"
            placeholder="e.g. X-API-Key"
            isRequired
          />
          <InputField
            name="apiKeyHeaderValue"
            label="API key"
            placeholder="API key"
            type="password"
            isRequired
          />
        </div>
      )}

      {authType === CustomApiToolAuthTypeEnum.ApiKeyQuery && (
        <div className="grid grid-cols-2 gap-3">
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
        </div>
      )}

      {crudAction !== "create" && (
        <SwitchField
          name="isDisabled"
          label="Disable record"
          description="Disable this record if it's been outdated, or not required anymore"
        />
      )}
    </>
  );
};

export { CustomApiToolForm };
