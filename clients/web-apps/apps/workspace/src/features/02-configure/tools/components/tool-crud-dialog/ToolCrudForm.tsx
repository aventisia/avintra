import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { JsonEditor } from "@/components/json-editor/JsonEditor";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { toolOptimisticMutationFn } from "../../apis/tools.apis";
import { toolZodSchema } from "../../constants/tools-zod-schema";
import { ToolDto } from "../../dtos/index";
import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";
import { useFetchCustomApiCredentials } from "../../hooks/useFetchCustomApiCredentials.hook";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { useToolForm } from "../../hooks/useToolForm.hook";

export const ToolCrudForm = ({
  rowId,
  crudAction,
}: {
  rowId: string;
  crudAction: DialogCrudAction;
}) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const { queryKey } = useTableTab();
  const { form, availabilityMessage, setAvailabilityMessage, handleInputChange } = useToolForm({
    rowId,
    crudAction,
  });

  const {
    mutate: mutateTool,
    isPending: isMutating,
    isSuccess,
  } = useListOptimisticMutation<ToolDto, ToolDto | boolean | number, ToolDto>(
    [rowId],
    toolOptimisticMutationFn,
    queryKey,
  );

  const { data: customApiCredentials, isLoading: isCredentialsLoading } =
    useFetchCustomApiCredentials();

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
        label="Unique Name"
        placeholder="My Custom API"
        isRequired
        description="A **unique** name for the tool.\n\n- **Max length:** 255 characters.\n- **Cannot be changed** after creation."
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        autoFocus
        disabled={crudAction !== "create"}
      />

      <TextareaField
        name="description"
        label="Description"
        placeholder="Describe what this tool does"
        description="A short summary of what the tool does."
      />

      <InputField
        name="iconUrl"
        label="Icon URL"
        placeholder="https://example.com/icon.svg"
        description="Optional URL of the icon that represents the tool. Defaults to the placeholder icon."
      />

      <InputField
        name="baseUrl"
        label="Base URL"
        placeholder="https://api.example.com"
        isRequired
        description="The base URL of the external API the tool calls (e.g. \`https://api.example.com\`)."
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium">OpenAPI Specification</label>
        <JsonEditor
          value={form.watch("openApiSpec") ?? ""}
          onChange={(value) => form.setValue("openApiSpec", value, { shouldDirty: true })}
          placeholder="Paste the OpenAPI JSON or YAML spec here"
          disabled={isReadMode}
        />
      </div>

      <SelectField
        name="authenticationType"
        label="Authentication Type"
        description="How the tool authenticates with the external API. Choose the method that matches the API."
        selectOptions={[
          { label: "No authentication", value: ToolAuthenticationTypeEnum.None },
          { label: "API Key (Header)", value: ToolAuthenticationTypeEnum.ApiKeyHeader },
          { label: "API Key (Query)", value: ToolAuthenticationTypeEnum.ApiKeyQuery },
          { label: "Bearer Token", value: ToolAuthenticationTypeEnum.Bearer },
          { label: "Basic Authentication", value: ToolAuthenticationTypeEnum.Basic },
        ]}
      />

      <SelectField
        name="credentialName"
        label="Credential"
        placeholder="Select a Custom API Tool credential"
        description="Select a Custom API Tool credential to use for authentication, if required."
        selectOptions={(customApiCredentials ?? []).map((cred) => ({
          label: cred.label,
          value: cred.value,
        }))}
        disabled={isReadMode || isCredentialsLoading}
      />

      {crudAction !== "create" && (
        <SwitchField name="isDisabled" label="Disabled" description="Disable this tool" />
      )}

      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button type="submit" disabled={isMutating} className="min-w-[5rem]">
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
