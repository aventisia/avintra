import { CopyableText, LoadingSpinner, Separator } from "@avplatform/ui";
import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, FormLabelExt, InputField, SwitchField } from "@avplatform/ui/form";
import { recordLabelClass } from "@avplatform/ui/record-sheet";
import { type CrudActionType } from "@avplatform/ui/types";
import { InfoIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { RenderField, shouldRenderField } from "@/features/dynamic-config-panel";
import { refineSubmittedIO } from "@/features/dynamic-config-panel/utils/refine-submitted-io";

import { VaultCredentialAppsEnum } from "../../enums/vault-credential-apps.enum";
import {
  buildCustomApiToolPayload,
  customApiToolSchema,
} from "../constants/custom-api-tool-schema.constant";
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

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isUpdating || isSubmitting}
    >
      {action === "create" && (
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
                placeholder="Search apps"
              />
            )}
          />
          {isType && <Separator />}
        </>
      )}
      {isType && isCustomApiToolSelected && (
        <CustomApiToolForm
          crudAction={crudAction}
          onNameChange={handleInputChange}
          availabilityMessage={availabilityMessage}
        />
      )}
      {isType && !isCustomApiToolSelected && isLoading && (
        <div className="flex items-center justify-center py-6">
          <LoadingSpinner className="size-5 text-primary" />
        </div>
      )}
      {isType && !isCustomApiToolSelected && !isLoading && (
        <>
          <InputField
            name="name"
            label="Unique name"
            placeholder="e.g. openai-production"
            description="Name cannot be modified after creation."
            autoFocus
            isRequired
            disabled={action !== "create"}
            onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
            nonErrorMessage={availabilityMessage}
          />
          {vaultCredentialConfig.map((field) => {
            if (!shouldRenderField("Input", field, watchedValues)) {
              if (inputKeys.includes(field.name))
                inputKeys.splice(inputKeys.indexOf(field.name), 1);
              return null;
            }

            if (!inputKeys.includes(field.name)) inputKeys.push(field.name);

            return <RenderField key={field.name} {...field} />;
          })}
          {showOutputFields && (
            <div className="space-y-3 rounded-lg bg-sunken/80 px-3.5 py-3 ring-1 ring-line">
              <p className={recordLabelClass}>Outputs</p>
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
          )}
        </>
      )}
      {isType && isOAuthCredential && (
        <>
          <div className="flex items-start gap-2 rounded-lg bg-selected px-3.5 py-3 text-[12.5px] leading-5 text-ink ring-1 ring-line">
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
            <p>
              After saving, a browser window opens where you sign in and grant access to your{" "}
              {isType} account. Complete the consent there before the credential can be used.
            </p>
          </div>
          <div className="space-y-1.5">
            <FormLabelExt
              label="OAuth redirect URL"
              description={`Add this URL to the allowed redirect URIs in your ${isType} app configuration.`}
            />
            <div className="flex h-11 items-center rounded-md bg-sunken px-3.5 ring-1 ring-line">
              <CopyableText
                value={`${window.location.origin}${import.meta.env.VITE_WORKSPACE_API_PATH}/integration/oauth-callback`}
                textClassName="text-[13px] text-muted-foreground"
                className="min-w-0 flex-1"
              />
            </div>
          </div>
        </>
      )}
      {isType && !isCustomApiToolSelected && action !== "create" && (
        <SwitchField
          name="isDisabled"
          label="Disable record"
          description="Disable this record if it's been outdated, or not required anymore"
        />
      )}
      {isType && (
        <CrudDialogActions>
          <SubmitButton
            primaryText={action === "create" ? "Create credential" : "Save changes"}
            secondaryText={action === "create" ? "Creating..." : "Saving..."}
            isPending={isSubmitting}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </CrudDialogActions>
      )}
    </Form>
  );
};

export default VaultCredentialDynamicForm;
