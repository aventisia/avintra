import { LoadingSpinner, Separator } from "@avplatform/ui";
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

import { VaultAppsEnum } from "../../enums/vault-apps-enum";
import {
  buildCustomApiToolPayload,
  customApiToolSchema,
} from "../constants/custom-api-tool-schema";
import { getDistinctVaultAppSelectOptions } from "../constants/vault-app-select-options";
import { OAUTH_CREDENTIAL_TYPES } from "../constants/oauth-credential-types";
import { useAddCredMutation } from "../hooks/useAddCredMutation";
import { useUpdateCredMutation } from "../hooks/useUpdateCredMutation";
import { useVaultDynamicForm } from "../hooks/useVaultDynamicForm";
import { AppSelector } from "./AppSelector";
import { CustomApiToolForm } from "./CustomApiToolForm";

interface VaultDynamicFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

const VaultDynamicForm = ({ rowId, crudAction }: VaultDynamicFormProps) => {
  const [showOutputFields, setShowOutputFields] = useState(false);
  const { onCloseConfirmed } = useCrudDialogDirty();

  const {
    form,
    inputKeys,
    isFormReady,
    outputKeys,

    vaultConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vaultConfigZodSchema,
    isLoading,
    watch,
    convertToObject,
    action,
    availabilityMessage,
    handleInputChange,
    isAvailable,
    isCheckPending,
    isDirty,
    vaultData,
  } = useVaultDynamicForm({ rowId, crudAction });

  // Watch all form values
  const watchedValues = watch();

  // Check if output fields should be shown based on node configuration and watched values
  useEffect(() => {
    const renderedOutputFields = vaultConfig.filter((field) =>
      shouldRenderField("Output", field, watchedValues),
    );

    setShowOutputFields(renderedOutputFields.map((field) => field.name).length > 0);
  }, [isFormReady, vaultConfig, watchedValues]);

  const { mutate, isComplete: isCreateComplete } = useAddCredMutation();

  const {
    mutate: updateMutation,
    isPending: isUpdating,
    isComplete: isUpdateComplete,
  } = useUpdateCredMutation();

  const isType = watch("selectedType")?.value;
  const isCustomApiToolSelected = isType === "CustomApiTool" || vaultData?.type === "CustomApiTool";
  const isOAuthCredential = Boolean(isType && OAUTH_CREDENTIAL_TYPES.has(isType));

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof vaultConfigZodSchema>) => {
    if (isCustomApiToolSelected) {
      // Use the live form values instead of the parsed resolver output so that
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
        type: VaultAppsEnum[VaultAppsEnum.CustomApiTool],
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

    // Extract node inputs and outputs from formData
    const { inputs } = refineSubmittedIO("nodeUniqueName", formData, inputKeys, outputKeys);
    if (action == "create") {
      // Create or update the config
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

  // Close dialog after successful create or update
  useEffect(() => {
    if ((action === "create" && isCreateComplete) || (action === "update" && isUpdateComplete)) {
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
        disabled={isReadOnly || isUpdating}
      >
        {/* Vault Id */}
        {isReadOnly && <InputField name="id" label="Vault Id" value={rowId} />}
        {action == "create" && (
          <>
            <Controller
              name="selectedType"
              control={form.control}
              render={({ field }) => (
                <AppSelector
                  autoFocus={true}
                  options={getDistinctVaultAppSelectOptions()}
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

                {/* Input fields */}
                <div className="mt-1 space-y-3.5">
                  {vaultConfig.map((field) => {
                    // Check if the field should be rendered based on direction and renderIf conditions
                    if (!shouldRenderField("Input", field, watchedValues)) {
                      //Remove the key from inputKeys if the field is not rendered
                      if (inputKeys.includes(field.name))
                        inputKeys.splice(inputKeys.indexOf(field.name), 1);
                      return null;
                    }

                    // Add the field name to inputKeys if not already present
                    if (!inputKeys.includes(field.name)) inputKeys.push(field.name);

                    // Render the field
                    return <RenderField key={field.name} {...field} />;
                  })}
                </div>
                {/* Output fields */}
                {showOutputFields ? (
                  <>
                    <h3 className="!mt-6 flex items-center gap-1 text-sm font-medium">
                      <span className="rounded-full bg-accent px-1.5 text-indigo-600">Outputs</span>
                      <span className="h-[0.06rem] flex-grow rounded bg-accent"></span>
                    </h3>

                    <div className="space-y-3 rounded-lg border bg-slate-50 px-3.5 py-3">
                      {vaultConfig.map((field) => {
                        // Check if the field should be rendered based on direction and renderIf conditions
                        if (!shouldRenderField("Output", field, watchedValues)) {
                          //Remove the key from outputKeys if the field is not rendered
                          if (outputKeys.includes(field.name))
                            outputKeys.splice(outputKeys.indexOf(field.name), 1);
                          return null;
                        }

                        // Add the field name to outputKeys if not already present
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

        {/* OAuth consent notice */}
        {isType && !isReadOnly && isOAuthCredential && (
          <div className="flex items-start gap-2 rounded-lg border bg-blue-50 px-3 py-2 text-sm text-blue-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              After saving, a popup will open to ask for permission to access
              your {isType} account. You must complete the consent flow before the
              credential can be used.
            </p>
          </div>
        )}

        {/* Save button */}
        {isType && !isReadOnly && (
          <div className="!mt-5 flex w-full justify-end">
            <SubmitButton
              className="min-w-[5rem]"
              primaryText={action === "create" ? "Save" : "Save changes"}
              secondaryText="Saving..."
              isPending={isUpdating}
              disabled={!isDirty || !isAvailable || isCheckPending}
            />
          </div>
        )}
      </Form>
    </>
  );
};

export default VaultDynamicForm;
