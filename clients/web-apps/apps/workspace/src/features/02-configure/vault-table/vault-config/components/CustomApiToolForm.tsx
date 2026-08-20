import { InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { type CrudActionType, type CustomFormMessage } from "@avplatform/ui/types";
import { useFormContext } from "react-hook-form";

import {
  CustomApiToolAuthTypeEnum,
  CustomApiToolVaultFormValues,
} from "../constants/custom-api-tool-schema";

interface CustomApiToolFormProps {
  rowId: string;
  crudAction: CrudActionType;
  onNameChange?: (value: string) => void;
  availabilityMessage?: CustomFormMessage | null;
}

/**
 * Field-only component for the CustomApiTool app secret type.
 *
 * It relies on the parent VaultDynamicForm FormProvider so that all fields
 * share a single form and a single submit handler.
 */
const CustomApiToolForm = ({
  rowId,
  crudAction,
  onNameChange,
  availabilityMessage,
}: CustomApiToolFormProps) => {
  const { watch } = useFormContext<CustomApiToolVaultFormValues>();
  const isReadOnly = crudAction === "read";
  const authType = watch("authenticationType");

  const authTypeOptions = [
    { label: "API Key (Header)", value: CustomApiToolAuthTypeEnum.ApiKeyHeader },
    { label: "API Key (Query)", value: CustomApiToolAuthTypeEnum.ApiKeyQuery },
    { label: "Bearer Token", value: CustomApiToolAuthTypeEnum.Bearer },
    { label: "Basic Authentication", value: CustomApiToolAuthTypeEnum.Basic },
  ];

  return (
    <div className="space-y-4 px-2.5 pb-5">
      {isReadOnly && <InputField name="id" label="Vault Id" value={rowId} disabled />}

      <InputField
        name="name"
        label="Unique Name"
        placeholder="Custom API Tool"
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
        label="Authentication Type"
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
            label="Header Name"
            placeholder="e.g. X-API-Key"
            isRequired
          />
          <InputField
            name="apiKeyHeaderValue"
            label="API Key"
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
            label="Parameter Name"
            placeholder="e.g. apiKey"
            isRequired
          />
          <InputField
            name="apiKeyQueryValue"
            label="API Key"
            placeholder="API key"
            type="password"
            isRequired
          />
        </>
      )}

      {crudAction !== "create" && (
        <SwitchField
          name="isDisabled"
          label="Disable Record"
          description="Disable this record if it's been outdated, or not required anymore"
        />
      )}
    </div>
  );
};

export { CustomApiToolForm };
