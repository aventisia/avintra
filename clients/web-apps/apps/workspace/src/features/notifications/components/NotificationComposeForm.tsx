import { SubmitButton } from "@avplatform/ui/buttons";
import { AsyncMultiSelectField } from "@avplatform/ui/components/form/fields/AsyncMultiSelectField";
import {
  AudienceScopeEnum,
  DeliveryChannelEnum,
  NotificationRecurrenceEnum,
  NotificationTypesEnum,
} from "@avplatform/ui/enums";
import { Form, InputField, MultiSelectField, SelectField, TextareaField } from "@avplatform/ui/form";
import { DateTimePickerField } from "@avplatform/ui/components/form/fields/DateTimePickerField";
import { ISelectOption } from "@avplatform/ui/types";
import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { searchWorkspaceUsers } from "../apis/notification-apis";
import { AppUserBaseDto } from "../dtos/app-user-base.dto";
import { CreateNotificationDto } from "../dtos/create-notification.dto";
import { NotificationDto } from "../dtos/notification.dto";
import { useCreateNotificationMutation } from "../hooks/useCreateNotificationMutation.hook";
import { useUpdateNotificationMutation } from "../hooks/useUpdateNotificationMutation.hook";
import {
  notificationZodSchema,
  useDefineNotificationForm,
} from "../hooks/useDefineNotificationForm.hook";
import { useFetchNotificationRoles } from "../hooks/useFetchNotificationRoles.hook";

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

  const { createNotificationMutation, isPending: isCreatePending } = useCreateNotificationMutation();
  const { updateNotificationMutation, isPending: isUpdatePending } = useUpdateNotificationMutation();

  const isPending = isCreatePending || isUpdatePending;

  const audienceScope = useWatch({ control: form.control, name: "audienceScope" });
  const recurrenceFrequency = useWatch({ control: form.control, name: "recurrenceFrequency" });

  // Track the previous audience scope so we only clear recipients when the user
  // actively switches away from "Selected Users" (not on the initial prefill).
  const previousAudienceScope = useRef(notification?.audienceScope ?? AudienceScopeEnum.AllUsers);

  // Guards against the reset-on-switch effect running on the initial mount, where the
  // watched audience scope is still the default value and would wrongly clear the
  // prefilled recipients.
  const isInitialMount = useRef(true);

  const notificationTypes: ISelectOption[] = Object.values(NotificationTypesEnum).map((value) => ({
    value,
    label: value,
  }));

  const deliveryChannels: ISelectOption[] = Object.values(DeliveryChannelEnum).map((value) => ({
    value,
    label: value,
  }));

  const audienceScopes: ISelectOption[] = [
    { value: AudienceScopeEnum.AllUsers, label: "All Users" },
    { value: AudienceScopeEnum.SelectedUsers, label: "Selected Users" },
    { value: AudienceScopeEnum.SelectedRoles, label: "Selected Roles" },
  ];

  const recurrenceOptions: ISelectOption[] = Object.values(NotificationRecurrenceEnum).map(
    (value) => ({ value, label: value }),
  );

  // Weekday options (1=Mon ... 7=Sun) for weekly recurrence
  const weekdayOptions: ISelectOption[] = [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
    { value: "7", label: "Sunday" },
  ];

  // Day-of-month options for monthly recurrence
  const monthDayOptions: ISelectOption[] = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

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
      scheduledFor: formData.scheduledFor ? formData.scheduledFor.toISOString() : undefined,
      recurrenceFrequency:
        formData.recurrenceFrequency && formData.recurrenceFrequency !== NotificationRecurrenceEnum.None
          ? formData.recurrenceFrequency
          : undefined,
      recurrenceInterval: formData.recurrenceInterval,
      recurrenceWeekdays:
        formData.recurrenceFrequency === NotificationRecurrenceEnum.Weekly &&
        formData.recurrenceWeekdays &&
        formData.recurrenceWeekdays.length > 0
          ? formData.recurrenceWeekdays.map(Number)
          : undefined,
      recurrenceMonthDays:
        formData.recurrenceFrequency === NotificationRecurrenceEnum.Monthly &&
        formData.recurrenceMonthDays &&
        formData.recurrenceMonthDays.length > 0
          ? formData.recurrenceMonthDays.map(Number)
          : undefined,
      recurrenceEndOn: formData.recurrenceEndOn ? formData.recurrenceEndOn.toISOString() : undefined,
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

    if (previous === AudienceScopeEnum.SelectedUsers && audienceScope !== AudienceScopeEnum.SelectedUsers) {
      form.setValue("recipients", []);
    }
  }, [audienceScope, form]);

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="px-2.5 pb-5">
      {/* Title */}
      <InputField name="title" label="Title" placeholder="Notification title" description="Max 200 characters." />

      {/* Message */}
      <TextareaField
        name="message"
        label="Message"
        isRequired
        placeholder="Enter the notification message"
        description="Max 500 characters."
      />

      {/* Action URL */}
      <InputField
        name="actionUrl"
        label="Action URL"
        placeholder="https://example.com/..."
        description="Optional deep-link URL. Max 1000 characters."
      />

      {/* Type */}
      <SelectField
        name="type"
        label="Type"
        isRequired
        selectOptions={notificationTypes}
        placeholder="Select type"
      />

      {/* Delivery channel */}
      <SelectField
        name="deliveryChannel"
        label="Delivery Channel"
        isRequired
        selectOptions={deliveryChannels}
        placeholder="Select delivery channel"
      />

      {/* Audience scope */}
      <SelectField
        name="audienceScope"
        label="Audience"
        isRequired
        selectOptions={audienceScopes}
        placeholder="Select audience"
        description="Tenant admins can only target users within their own tenant."
      />

      {/* Recipient roles (only for SelectedRoles) */}
      {audienceScope === AudienceScopeEnum.SelectedRoles && (
        <MultiSelectField
          name="roleIds"
          label="Recipient Roles"
          selectOptions={roleOptions}
          placeholder="Select roles"
          description="Only users holding the selected roles will receive this notification."
        />
      )}

      {/* Recipient users (only for SelectedUsers) */}
      {audienceScope === AudienceScopeEnum.SelectedUsers && (
        <AsyncMultiSelectField<AppUserBaseDto>
          name="recipients"
          label="Recipients"
          fetcher={(query) =>
            searchWorkspaceUsers(query, false).then((res) => res.data ?? [])
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

      {/* Scheduled send time */}
      <DateTimePickerField
        name="scheduledFor"
        label="Schedule Send"
        description="Leave empty to send immediately."
      />

      {/* Recurrence */}
      <SelectField
        name="recurrenceFrequency"
        label="Recurrence"
        selectOptions={recurrenceOptions}
        placeholder="Select recurrence"
        description="Choose how often this notification repeats."
      />

      {recurrenceFrequency === NotificationRecurrenceEnum.Weekly && (
        <MultiSelectField
          name="recurrenceWeekdays"
          label="Weekdays"
          selectOptions={weekdayOptions}
          placeholder="Select weekdays"
          description="Days of the week on which this notification recurs."
        />
      )}

      {recurrenceFrequency === NotificationRecurrenceEnum.Monthly && (
        <MultiSelectField
          name="recurrenceMonthDays"
          label="Days of Month"
          selectOptions={monthDayOptions}
          placeholder="Select days"
          description="Days of the month on which this notification recurs."
        />
      )}

      {recurrenceFrequency && recurrenceFrequency !== NotificationRecurrenceEnum.None && (
        <DateTimePickerField
          name="recurrenceEndOn"
          label="Recurrence End Date"
          description="The date after which this recurring notification stops."
        />
      )}

      {/* Submit button */}
      <div className="!mt-5 flex w-full justify-end">
        <SubmitButton
          className="min-w-[5rem]"
          primaryText={isEdit ? "Save changes" : "Create"}
          secondaryText="Saving..."
          isPending={isPending}
          disabled={!isDirty || !isValid || isPending}
        />
      </div>
    </Form>
  );
};
