import { SubmitButton } from "@avplatform/ui/buttons";
import { AsyncMultiSelectField } from "@avplatform/ui/components/form/fields/AsyncMultiSelectField";
import { CrudDialogActions } from "@avplatform/ui/crud-dialog";
import { AudienceScopeEnum } from "@avplatform/ui/enums";
import { Form, MultiSelectField, SelectField } from "@avplatform/ui/form";
import { ISelectOption } from "@avplatform/ui/types";
import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import {
  NotificationContentFields,
  NotificationScheduleFields,
  buildNotificationSchedulePayload,
} from "@/features/notifications";

import { AppUserBaseDto } from "../../../notifications/dtos/app-user-base.dto";
import { getSaTenants, searchAllUsers } from "../apis/sa-notification-apis.ee";
import { CreateSaNotificationDto } from "../dtos/create-sa-notification.dto.ee";
import { SaNotificationDto } from "../dtos/sa-notification.dto.ee";
import { SaTenantOptionDto } from "../dtos/sa-tenant-option.dto.ee";
import { useCreateSaNotificationMutation } from "../hooks/useCreateSaNotificationMutation.hook.ee";
import {
  saNotificationZodSchema,
  useDefineSaNotificationForm,
} from "../hooks/useDefineSaNotificationForm.hook.ee";
import { useFetchSaNotificationRoles } from "../hooks/useFetchSaNotificationRoles.hook.ee";
import { useUpdateSaNotificationMutation } from "../hooks/useUpdateSaNotificationMutation.hook.ee";

interface SaNotificationComposeFormProps {
  /** The notification being edited, or null for create. */
  notification?: SaNotificationDto | null;

  /** The selected recipient users (used to prefill the edit form). */
  recipients?: AppUserBaseDto[];

  /** The selected target tenants (used to prefill the edit form). */
  tenants?: SaTenantOptionDto[];

  /** Callback invoked when the notification is created/updated successfully. */
  onSuccess?: () => void;
}

/**
 * Form for composing and sending a platform-wide notification as a Super Admin.
 * Supports All Users, Selected Users, and Selected Tenants audience scopes.
 */
export const SaNotificationComposeForm = ({
  notification = null,
  recipients,
  tenants,
  onSuccess,
}: SaNotificationComposeFormProps) => {
  const isEdit = Boolean(notification);

  // Initialize the form directly from the loaded notification (if editing) so the
  // audience selection (recipients / tenants) is reflected on first render.
  const { form, isDirty, isValid } = useDefineSaNotificationForm(notification, recipients, tenants);

  const { createSaNotificationMutation, isPending: isCreatePending } =
    useCreateSaNotificationMutation();
  const { updateSaNotificationMutation, isPending: isUpdatePending } =
    useUpdateSaNotificationMutation();

  const isPending = isCreatePending || isUpdatePending;

  const audienceScope = useWatch({ control: form.control, name: "audienceScope" });

  // Track the previous audience scope so we only clear recipients/tenants when the user
  // actively switches away from the current scope (not on the initial prefill).
  const previousAudienceScope = useRef(notification?.audienceScope ?? AudienceScopeEnum.AllUsers);

  // Guards against the reset-on-switch effect running on the initial mount, where the
  // watched audience scope is still the default value and would wrongly clear the
  // prefilled recipients/tenants.
  const isInitialMount = useRef(true);

  const audienceScopes: ISelectOption[] = [
    { value: AudienceScopeEnum.AllUsers, label: "All users" },
    { value: AudienceScopeEnum.SelectedUsers, label: "Selected users" },
    { value: AudienceScopeEnum.SelectedRoles, label: "Selected roles" },
    { value: AudienceScopeEnum.SelectedTenants, label: "Selected tenants" },
  ];

  // Fetch roles for recipient targeting
  const { data: rolesData } = useFetchSaNotificationRoles();
  const roleOptions: ISelectOption[] = rolesData?.data ?? [];

  const onSubmit = (formData: z.infer<typeof saNotificationZodSchema>) => {
    const payload: CreateSaNotificationDto = {
      title: formData.title,
      message: formData.message,
      actionUrl: formData.actionUrl || undefined,
      type: formData.type,
      deliveryChannel: formData.deliveryChannel,
      audienceScope: formData.audienceScope,
      targetUserIds:
        formData.audienceScope === AudienceScopeEnum.SelectedUsers
          ? (formData.recipients ?? []).map((recipient) => recipient.id)
          : undefined,
      targetTenantIds:
        formData.audienceScope === AudienceScopeEnum.SelectedTenants
          ? (formData.tenants ?? []).map((tenant) => tenant.id)
          : undefined,
      roleIds:
        formData.audienceScope === AudienceScopeEnum.SelectedRoles &&
        formData.roleIds &&
        formData.roleIds.length > 0
          ? formData.roleIds
          : undefined,
      ...buildNotificationSchedulePayload(formData),
    };

    if (isEdit && notification) {
      updateSaNotificationMutation({ id: notification.id, payload }, { onSuccess });
    } else {
      createSaNotificationMutation(payload, { onSuccess });
    }
  };

  // Reset recipient/tenant selection when the user switches away from the current scope.
  // Uses the previous scope so the initial prefill is not wiped out on mount.
  useEffect(() => {
    // Skip the initial render: the watched audience scope is still the default value and
    // would otherwise clear the recipients/tenants prefilled when editing.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const previous = previousAudienceScope.current;
    previousAudienceScope.current = audienceScope;

    if (
      previous === AudienceScopeEnum.SelectedUsers &&
      audienceScope !== AudienceScopeEnum.SelectedUsers
    ) {
      form.setValue("recipients", []);
    }
    if (
      previous === AudienceScopeEnum.SelectedTenants &&
      audienceScope !== AudienceScopeEnum.SelectedTenants
    ) {
      form.setValue("tenants", []);
    }
  }, [audienceScope, form]);

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <NotificationContentFields />

      <SelectField
        name="audienceScope"
        label="Audience"
        isRequired
        selectOptions={audienceScopes}
        placeholder="Select audience"
        description="Super admins can target all users, selected users, or all users of selected tenants."
      />

      {audienceScope === AudienceScopeEnum.SelectedRoles && (
        <MultiSelectField
          name="roleIds"
          label="Roles"
          selectOptions={roleOptions}
          placeholder="Select roles"
          description="Only users holding the selected roles will receive this notification."
        />
      )}

      {audienceScope === AudienceScopeEnum.SelectedUsers && (
        <AsyncMultiSelectField<AppUserBaseDto>
          name="recipients"
          label="Users"
          fetcher={(query) => searchAllUsers(query).then((res) => res.data ?? [])}
          getItemId={(item) => item.id}
          getItemLabel={(item) =>
            `${item.firstName} ${item.lastName}${item.userName ? ` (${item.userName})` : ""}`
          }
          queryKeyBase={["sa-notification-recipient-users"]}
          filters={undefined}
          placeholder="Search users across all tenants..."
          description="Select one or more users across any tenant."
        />
      )}

      {audienceScope === AudienceScopeEnum.SelectedTenants && (
        <AsyncMultiSelectField<SaTenantOptionDto>
          name="tenants"
          label="Tenants"
          fetcher={() => getSaTenants().then((res) => res.data ?? [])}
          getItemId={(item) => item.id}
          getItemLabel={(item) => item.name}
          queryKeyBase={["sa-notification-tenants"]}
          filters={undefined}
          placeholder="Search tenants..."
          description="Select one or more tenants. All users of the selected tenants will be notified."
        />
      )}

      <NotificationScheduleFields />

      <CrudDialogActions>
        <SubmitButton
          primaryText={isEdit ? "Save changes" : "Create notification"}
          secondaryText={isEdit ? "Saving..." : "Creating..."}
          isPending={isPending}
          disabled={!isDirty || !isValid || isPending}
        />
      </CrudDialogActions>
    </Form>
  );
};
