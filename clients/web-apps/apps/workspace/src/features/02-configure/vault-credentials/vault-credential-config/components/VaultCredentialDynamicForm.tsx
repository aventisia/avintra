import { CopyableText, LoadingSpinner, Separator } from "@avplatform/ui";
import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SwitchField } from "@avplatform/ui/form";
import { type CrudActionType } from "@avplatform/ui/types";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { RenderField, shouldRenderField } from "@/features/dynamic-config-panel";
import { refineSubmittedIO } from "@/features/dynamic-config-panel/utils/refine-submitted-io";

import { VaultCredentialAppsEnum } from "../../enums/vault-credential-apps.enum";
import {
  buildCustomApiToolPayload,
  customApiToolSchema,
} from "../constants/custom-api-tool-schema";
import { getDistinctVaultCredentialAppSelectOptions } from "../constants/vault-credential-app-select-options.constant";
import { OAUTH_CREDENTIAL_TYPES } from "../constants/vault-credential-oauth-types.constant";
import { useAddVaultCredentialMutation } from "../hooks/useAddVaultCredentialMutation";
import { useUpdateVaultCredentialMutation } from "../hooks/useUpdateVaultCredentialMutation";
import { useVaultCredentialDynamicForm } from "../hooks/useVaultCredentialDynamicForm.hook";
import { AppSelector } from "./AppSelector";
import { CustomApiToolForm } from "./CustomApiToolForm";

interface VaultCredentialDynamicFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

const VaultCredentialDynamicForm = ({ rowId, crudAction }: VaultCredentialDynamicFormProps) => {
  const [showOutputFields, setShowOutputFields] = useState(false);
  // IMPORTANT NOTE: The loader must stay visible for the whole submit lifecycle (API + OAuth
  // consent). `isPending` from react-query clears as soon as the API responds, but OAuth
  // credentials require the dialog to remain busy until consent completes.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onCloseConfirmed } = useCrudDialogDirty();

  const {
    form,
    inputKeys,
    isFormReady,
    outputKeys,

    vaultCredentialConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vaultCredentialConfigZodSchema,
    isLoading,
    watch,
    convertToObject,
    action,
    availabilityMessage,
    handleInputChange,
    isAvailable,
    isCheckPending,
    isDirty,
    vaultCredentialData,
  } = useVaultCredentialDynamicForm({ rowId, crudAction });

  const watchedValues = watch();

  useEffect(() => {
    const renderedOutputFields = vaultCredentialConfig.filter((field) =>
      shouldRenderField("Output", field, watchedValues),
    );

    setShowOutputFields(renderedOutputFields.map((field) => field.name).length > 0);
  }, [isFormReady, vaultCredentialConfig, watchedValues]);

  const { mutate, isComplete: isCreateComplete } = useAddVaultCredentialMutation();

  const {
    mutate: updateMutation,
    isPending: isUpdating,
    isComplete: isUpdateComplete,
  } = useUpdateVaultCredentialMutation();

  const isType = watch("selectedType")?.value;
  const isCustomApiToolSelected =
    isType === "CustomApiTool" || vaultCredentialData?.type === "CustomApiTool";
  const isOAuthCredential = Boolean(isType && OAUTH_CREDENTIAL_TYPES.has(isType));

  const onSubmit = (formData: z.infer<typeof vaultCredentialConfigZodSchema>) => {
    setIsSubmitting(true);

    if (isCustomApiToolSelected) {
      // IMPORTANT NOTE: Use live form values instead of the parsed resolver output so
      // transient/initial empty schemas do not strip the CustomApiTool fields.
      const rawValues = form.getValues();

      const parsed = customApiToolSchema.safeParse(rawValues);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          form.setError(issue.path.join(".") as string, { message: issue.message });
        });
        return;
      }

      const customValues = parsed.data;

      const payload = {
        id: crudAction === "update" ? rowId : undefined,
        type: VaultCredentialAppsEnum[VaultCredentialAppsEnum.CustomApiTool],
        name: customValues.name.trim(),
        description: customValues.description?.trim(),
        data: buildCustomApiToolPayload(customValues),
        isDisabled: customValues.isDisabled ?? false,
      };

      if (action === "create") {
        mutate(payload);
      } else {
        updateMutation(payload);
      }
      return;
    }

    const { inputs } = refineSubmittedIO("nodeUniqueName", formData, inputKeys, outputKeys);
    if (action == "create") {
      mutate({
        type: formData.selectedType?.value,
        name: formData.name,

        data: convertToObject(inputs) as unknown as {
          [key: string]: string | number | boolean | null;
        },
      });
    } else if (action == "update") {
      updateMutation({
        id: rowId,
        type: formData.selectedType?.value,
        name: formData.name,
        isDisabled: formData.isDisabled,
        data: convertToObject(inputs) as unknown as {
          [key: string]: string | number | boolean | null;
        },
      });
    }
  };

  useEffect(() => {
    if ((action === "create" && isCreateComplete) || (action === "update" && isUpdateComplete)) {
      setIsSubmitting(false);
      onCloseConfirmed();
    }
  }, [action, isCreateComplete, isUpdateComplete, onCloseConfirmed]);

  const isReadOnly = action == "read";

  return (
    <>
      <Form
        methods={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className="px-2.5 pb-5"
        disabled={isReadOnly || isUpdating || isSubmitting}
      >
        {isReadOnly && <InputField name="id" label="Vault Id" value={rowId} />}
        {action == "create" && (
          <>
            <Controller
              name="selectedType"
              control={form.control}
              render={({ field }) => (
                <AppSelector
                  autoFocus={true}
                  options={getDistinctVaultCredentialAppSelectOptions()}
                  selectedItem={field.value || null}
                  onItemSelect={(item) => field.onChange(item)}
                  onItemClear={() => field.onChange(null)}
                  placeholder="Search"
                />
              )}
            />
            {isType && <Separator />}{" "}
          </>
        )}
        {isType && isCustomApiToolSelected && (
          <CustomApiToolForm
            rowId={rowId}
            crudAction={crudAction}
            onNameChange={handleInputChange}
            availabilityMessage={availabilityMessage}
          />
        )}
        {isType && !isCustomApiToolSelected ? (
          <>
            {" "}
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-sm">
                <LoadingSpinner className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <>
                <InputField
                  name="name"
                  label="Unique Name"
                  description="Name cannot be modified after creation."
                  autoFocus
                  isRequired
                  disabled={action !== "create"}
                  onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
                  nonErrorMessage={availabilityMessage}
                />

                <div className="mt-1 space-y-3.5">
                  {vaultCredentialConfig.map((field) => {
                    if (!shouldRenderField("Input", field, watchedValues)) {
                      if (inputKeys.includes(field.name))
                        inputKeys.splice(inputKeys.indexOf(field.name), 1);
                      return null;
                    }

                    if (!inputKeys.includes(field.name)) inputKeys.push(field.name);

                    return <RenderField key={field.name} {...field} />;
                  })}
                </div>
                {showOutputFields ? (
                  <>
                    <h3 className="!mt-6 flex items-center gap-1 text-sm font-medium">
                      <span className="rounded-full bg-accent px-1.5 text-indigo-600">Outputs</span>
                      <span className="h-[0.06rem] flex-grow rounded bg-accent"></span>
                    </h3>

                    <div className="space-y-3 rounded-lg border bg-slate-50 px-3.5 py-3">
                      {vaultCredentialConfig.map((field) => {
                        if (!shouldRenderField("Output", field, watchedValues)) {
                          if (outputKeys.includes(field.name))
                            outputKeys.splice(outputKeys.indexOf(field.name), 1);
                          return null;
                        }

                        if (!outputKeys.includes(field.name)) outputKeys.push(field.name);

                        return <RenderField key={field.name} {...field} />;
                      })}
                    </div>
                  </>
                ) : null}
              </>
            )}
            {action !== "create" && (
              <SwitchField
                name="isDisabled"
                label="Disable Record"
                description="Disable this record if it's been outdated, or not required anymore"
              />
            )}
          </>
        ) : null}

        {isType && !isReadOnly && isOAuthCredential && (
          <div className="flex items-start gap-2 rounded-lg border bg-blue-50 px-3 py-2 text-sm text-blue-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              After saving, a browser window will open where you can sign in and grant access to
              your {isType} account. Complete the consent flow in your browser before the credential
              can be used.
            </p>
          </div>
        )}

        {isType && isOAuthCredential && (
          <div className="mt-1 space-y-1.5">
            <label className="text-sm font-medium">OAuth Redirect URL</label>
            <div className="flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2">
              <CopyableText
                value={`${window.location.origin}${import.meta.env.VITE_WORKSPACE_API_PATH}/integration/oauth-callback`}
                textClassName="text-sm text-muted-foreground"
                className="min-w-0 flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Add this URL to the allowed redirect URIs in your {isType} app configuration.
            </p>
          </div>
        )}

        {isType && !isReadOnly && (
          <div className="!mt-5 flex w-full justify-end">
            <SubmitButton
              className="min-w-[5rem]"
              primaryText={action === "create" ? "Save" : "Save changes"}
              secondaryText="Saving..."
              isPending={isSubmitting}
              disabled={!isDirty || !isAvailable || isCheckPending}
            />
          </div>
        )}
      </Form>
    </>
  );
};

export default VaultCredentialDynamicForm;
