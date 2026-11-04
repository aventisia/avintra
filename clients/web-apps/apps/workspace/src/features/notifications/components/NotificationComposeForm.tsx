import { searchUsers, toUserSelectItem } from "@avplatform/ui/apis/search-users-apis";
import { SubmitButton } from "@avplatform/ui/buttons";
import { AsyncMultiSelectField } from "@avplatform/ui/components/form/fields/AsyncMultiSelectField";
import { CrudDialogActions } from "@avplatform/ui/crud-dialog";
import { AudienceScopeEnum } from "@avplatform/ui/enums";
import { Form, MultiSelectField, SelectField } from "@avplatform/ui/form";
import { ISelectOption } from "@avplatform/ui/types";
import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { getSpaceHeaders } from "@/utils/space-headers";

import { AppUserBaseDto } from "../dtos/app-user-base.dto";
import { CreateNotificationDto } from "../dtos/create-notification.dto";
import { NotificationDto } from "../dtos/notification.dto";
import { useCreateNotificationMutation } from "../hooks/useCreateNotificationMutation.hook";
import {
  notificationZodSchema,
  useDefineNotificationForm,
} from "../hooks/useDefineNotificationForm.hook";
import { useFetchNotificationRoles } from "../hooks/useFetchNotificationRoles.hook";
import { useUpdateNotificationMutation } from "../hooks/useUpdateNotificationMutation.hook";
import { buildNotificationSchedulePayload } from "../utils/notification-schedule-payload.util";
import { NotificationContentFields } from "./NotificationContentFields";
import { NotificationScheduleFields } from "./NotificationScheduleFields";

// The Super Admin role's display name (FullName) as returned by the roles-to-select API.
const SUPER_ADMIN_ROLE_LABEL = "Super administrator";

// Returns true when the given role option represents the Super Admin role.
const isSuperAdminRole = (role: ISelectOption) =>
  role.value === SUPER_ADMIN_ROLE_LABEL || role.label === SUPER_ADMIN_ROLE_LABEL;

interface NotificationComposeFormProps {
  /** The notification being edited, or null for create. */
  notification?: NotificationDto | null;

  /** The selected recipient users (used to prefill the edit form). */
  recipients?: AppUserBaseDto[];

  /** Callback invoked when the notification is created/updated successfully. */
  onSuccess?: () => void;
}

/**
 * Form for composing and sending a notification to users within the current tenant.
 * Supports both create and update flows (edit is only allowed before the notification is sent).
 */
export const NotificationComposeForm = ({
  notification = null,
  recipients,
  onSuccess,
}: NotificationComposeFormProps) => {
  const isEdit = Boolean(notification);

  // Initialize the form directly from the loaded notification (if editing) so the
  // audience selection (recipients) is reflected on first render.
  const { form, isDirty, isValid } = useDefineNotificationForm(notification, recipients);

  const { createNotificationMutation, isPending: isCreatePending } =
    useCreateNotificationMutation();
  const { updateNotificationMutation, isPending: isUpdatePending } =
    useUpdateNotificationMutation();

  const isPending = isCreatePending || isUpdatePending;

  const audienceScope = useWatch({ control: form.control, name: "audienceScope" });

  // Track the previous audience scope so we only clear recipients when the user
  // actively switches away from "Selected Users" (not on the initial prefill).
  const previousAudienceScope = useRef(notification?.audienceScope ?? AudienceScopeEnum.AllUsers);

  // Guards against the reset-on-switch effect running on the initial mount, where the
  // watched audience scope is still the default value and would wrongly clear the
  // prefilled recipients.
  const isInitialMount = useRef(true);

  const audienceScopes: ISelectOption[] = [
    { value: AudienceScopeEnum.AllUsers, label: "All users" },
    { value: AudienceScopeEnum.SelectedUsers, label: "Selected users" },
    { value: AudienceScopeEnum.SelectedRoles, label: "Selected roles" },
  ];

  // Fetch roles for recipient targeting
  const { data: rolesData } = useFetchNotificationRoles();

  // Tenant Admin users must not be able to target the Super Admin role, so
  // exclude it from the role list before displaying.
  const roleOptions: ISelectOption[] = (rolesData?.data ?? []).filter(
    (role) => !isSuperAdminRole(role),
  );

  const onSubmit = (formData: z.infer<typeof notificationZodSchema>) => {
    const payload: CreateNotificationDto = {
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
      roleIds:
        formData.audienceScope === AudienceScopeEnum.SelectedRoles &&
        formData.roleIds &&
        formData.roleIds.length > 0
          ? formData.roleIds
          : undefined,
      ...buildNotificationSchedulePayload(formData),
    };

    if (isEdit && notification) {
      updateNotificationMutation({ id: notification.id, payload }, { onSuccess });
    } else {
      createNotificationMutation(payload, { onSuccess });
    }
  };

  // Reset recipient selection when the user switches away from SelectedUsers.
  // Uses the previous scope so the initial prefill (which may be SelectedUsers)
  // is not wiped out on mount.
  useEffect(() => {
    // Skip the initial render: the watched audience scope is still the default value and
    // would otherwise clear the recipients prefilled when editing.
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
        description="Tenant admins can only target users within their own tenant."
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
          fetcher={(query) =>
            searchUsers(query, false, false, getSpaceHeaders()).then((res) =>
              (res.data ?? []).map(toUserSelectItem),
            )
          }
          getItemId={(item) => item.id}
          getItemLabel={(item) =>
            `${item.firstName} ${item.lastName}${item.userName ? ` (${item.userName})` : ""}`
          }
          queryKeyBase={["notification-recipient-users"]}
          filters={undefined}
          placeholder="Search users..."
          description="Select one or more users within your tenant."
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
