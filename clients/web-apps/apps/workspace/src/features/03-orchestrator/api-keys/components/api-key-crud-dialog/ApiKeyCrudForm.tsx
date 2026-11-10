import { CopyableText } from "@avplatform/ui";
import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SwitchField } from "@avplatform/ui/form";
import { DateTimePickerField } from "@avplatform/ui/form";
import { useShowAlertHandler, useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useEffect } from "react";

import { updateApiKey } from "../../apis/api-key.apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  expiresAtProps,
  isRevokedProps,
  nameProps,
} from "../../constants/api-key-form-field-props.constant";
import type { ApiKeyDto } from "../../dtos/api-key.dto";
import type { UpdateApiKeyDto } from "../../dtos/update-api-key.dto";
import { useApiKeyMutations } from "../../hooks/useApiKeyMutations.hook";
import { useDefineApiKeyForm } from "../../hooks/useDefineApiKeyForm.hook";
import { FeatureAccessSection } from "./FeatureAccessSection";

interface ApiKeyCrudFormProps {
  rowId: string;
  crudAction: "create" | "update";
}

export const ApiKeyCrudForm = ({ rowId, crudAction }: ApiKeyCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const { showCustomAlertDialog } = useShowAlertHandler();
  const isCreate = crudAction === "create";

  // Custom mutation for create because the response contains the plain API key to display once.
  const { createApiKey: createApiKeyMutation, isCreatePending } = useApiKeyMutations();

  const {
    mutate: updateMutate,
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
  } = useTableRowOptimisticMutation<UpdateApiKeyDto, ApiKeyDto, ApiKeyDto>(
    "update",
    [rowId],
    updateApiKey,
    DATA_QUERY_KEY,
    "desc",
    true,
    [["apiKey", rowId]],
  );

  const { form, isDirty, isValid, isRevoked } = useDefineApiKeyForm({ rowId, crudAction });

  // Close the dialog when an already-revoked key is opened in edit mode; revocation is permanent.
  useEffect(() => {
    if (!isCreate && isRevoked) {
      toast.info("Revoked API keys cannot be edited.");
      onCloseConfirmed();
    }
  }, [isCreate, isRevoked, onCloseConfirmed]);

  useEffect(() => {
    if (isUpdateSuccess) onCloseConfirmed();
  }, [isUpdateSuccess, onCloseConfirmed]);

  // Show the plain API key in the global alert dialog after creation.
  const showCreatedKeyAlert = (plainApiKey: string) => {
    showCustomAlertDialog({
      title: "Your API key",
      description: "Copy it now. For security reasons, this key will not be shown again.",
      content: (
        <div className="min-w-0 rounded w-full border border-line bg-sunken pl-4 py-2 pr-1">
          <CopyableText
            value={plainApiKey}
            copyValue={plainApiKey}
            className="w-full items-start gap-2 text-xs"
            textClassName="break-all !font-mono !whitespace-normal"
            copyButtonClassName="h-8 ml-2 mt-1 w-8 text-base"
            iconClassName="size-3.5"
          />
        </div>
      ),
      confirmActionFn: () => {},
      confirmBtnText: "Done",
      cancelBtnText: "",
      isDestructive: false,
    });
  };

  const onSubmit = form.handleSubmit(async (formData) => {
    const expiresAt = formData.expiresAt ? formData.expiresAt.toISOString() : null;

    if (isCreate) {
      const response = await createApiKeyMutation({
        name: formData.name,
        expiresAt,
        permissions: formData.permissions ?? null,
      });
      if (response.data?.plainApiKey) {
        onCloseConfirmed();
        showCreatedKeyAlert(response.data.plainApiKey);
      }
    } else {
      updateMutate({
        id: rowId,
        name: formData.name,
        expiresAt,
        permissions: formData.permissions ?? null,
        isRevoked: formData.isRevoked,
      });
    }
  });

  return (
    <Form methods={form} onSubmit={onSubmit}>
      <InputField {...nameProps} autoFocus />

      <DateTimePickerField {...expiresAtProps} />

      <FeatureAccessSection />

      {!isCreate && <SwitchField {...isRevokedProps} />}

      <CrudDialogActions>
        <SubmitButton
          primaryText={isCreate ? "Create API key" : "Save changes"}
          secondaryText={isCreate ? "Creating..." : "Saving..."}
          isPending={isCreate ? isCreatePending : isUpdatePending}
          disabled={!isDirty || !isValid || (isCreate ? isCreatePending : isUpdatePending)}
        />
      </CrudDialogActions>
    </Form>
  );
};
