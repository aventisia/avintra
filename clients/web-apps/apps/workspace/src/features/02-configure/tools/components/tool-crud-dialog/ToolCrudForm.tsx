import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { toolOptimisticMutationFn } from "../../apis/tools.apis";
import { toolZodSchema } from "../../constants/tools-zod-schema";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { useFetchCustomApiCredentials } from "../../hooks/useFetchCustomApiCredentials.hook";
import { useToolForm } from "../../hooks/useToolForm.hook";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { ToolDto } from "../../dtos/index";
import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";

export const ToolCrudForm = ({
  rowId,
  crudAction,
}: {
  rowId: string;
  crudAction: DialogCrudAction;
}) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const { queryKey } = useTableTab();
  const {
    form,
    isDirty,
    isAvailable,
    isCheckPending,
    availabilityMessage,
    setAvailabilityMessage,
    handleInputChange,
  } = useToolForm({ rowId, crudAction });

  const {
    mutate: mutateTool,
    isPending: isMutating,
    isSuccess,
  } = useListOptimisticMutation<ToolDto, ToolDto | boolean, ToolDto>(
    [rowId],
    toolOptimisticMutationFn,
    queryKey,
  );

  const { data: customApiCredentials, isLoading: isCredentialsLoading } = useFetchCustomApiCredentials();

  const onSubmit = (formData: z.infer<typeof toolZodSchema>) => {
    const payload: ToolDto = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      accessLevel: formData.accessLevel ?? ResourceAccessTypeEnum.Owner,
    };
    mutateTool({ payload, crudAction });
    setAvailabilityMessage(null);
  };

  useEffect(() => {
    if (isSuccess) onCloseConfirmed();
  }, [isSuccess, onCloseConfirmed]);

  const isReadMode = crudAction === "read";

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {isReadMode && <InputField name="id" label="Id" disabled />}

      <InputField
        name="name"
        label="Name"
        placeholder="My Custom API"
        isRequired
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        autoFocus
        disabled={crudAction !== "create"}
      />

      <TextareaField name="description" label="Description" placeholder="Describe what this tool does" />

      <InputField
        name="baseUrl"
        label="Base URL"
        placeholder="https://api.example.com"
        isRequired
      />

      <TextareaField
        name="openApiSpec"
        label="OpenAPI Specification"
        placeholder="Paste the OpenAPI JSON or YAML spec here"
        className="min-h-40 font-mono text-xs"
      />

      <SelectField
        name="authenticationType"
        label="Authentication Type"
        selectOptions={[
          { label: "No authentication", value: ToolAuthenticationTypeEnum.None },
          { label: "API Key (Header)", value: ToolAuthenticationTypeEnum.ApiKeyHeader },
          { label: "API Key (Query)", value: ToolAuthenticationTypeEnum.ApiKeyQuery },
          { label: "Bearer Token", value: ToolAuthenticationTypeEnum.Bearer },
          { label: "Basic Authentication", value: ToolAuthenticationTypeEnum.Basic },
        ]}
      />

      <SelectField
        name="credentialId"
        label="Credential"
        placeholder="Select a Custom API Tool credential"
        selectOptions={(customApiCredentials ?? []).map((cred) => ({
          label: cred.label,
          value: cred.value,
        }))}
        disabled={isReadMode || isCredentialsLoading}
      />

      <SwitchField
        name="isTenantWideAccess"
        label="Tenant Wide Access"
        description="Make this tool available to all users in the tenant"
      />

      {crudAction !== "create" && (
        <SwitchField
          name="isDisabled"
          label="Disabled"
          description="Disable this tool"
        />
      )}

      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending || isMutating}
            className="min-w-[5rem]"
          >
            {isMutating
              ? crudAction === "create"
                ? "Creating..."
                : "Saving..."
              : crudAction === "create"
                ? "Create"
                : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
