import { DeliveryChannelEnum } from "@avplatform/ui/enums";
import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { ISelectOption } from "@avplatform/ui/types";
import { z } from "zod";

import {
  deliveryChannelProps,
  lowCreditThresholdProps,
  lowCreditsProps,
  publishAgentProps,
  subscriptionRenewalReminderDaysProps,
  subscriptionProps,
} from "@/features/05-tenant-admin/tenant/constants/notification-settings-field-props";
import { notificationSettingsSchema } from "@/features/05-tenant-admin/tenant/constants/notification-settings-zod-schema";
import { useDefineNotificationSettingsForm } from "@/features/05-tenant-admin/tenant/hooks/useDefineNotificationSettingsForm";

import TabLoader from "../TabLoader";

const NotificationsForm = () => {
  const { form, isDirty, isSubmitting, isPending, mutate, isLoading } =
    useDefineNotificationSettingsForm();

  // Delivery channel options (Platform, Email, Both).
  const deliveryChannelOptions: ISelectOption[] = Object.values(DeliveryChannelEnum).map(
    (value) => ({ value, label: value }),
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof notificationSettingsSchema>) => {
    mutate(formData);
  };

  if (isLoading) return <TabLoader />;

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isPending || isLoading}
      checkDirtyForm={false}
    >
      <SelectField {...deliveryChannelProps} selectOptions={deliveryChannelOptions} />
      <SwitchField {...lowCreditsProps} />
      <InputField {...lowCreditThresholdProps} />
      <SwitchField {...subscriptionProps} />
      <InputField {...subscriptionRenewalReminderDaysProps} />
      <SwitchField {...publishAgentProps} />
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty || isPending}>
          {isSubmitting || isPending ? (
            <>
              <LoadingSpinner className="mr-1 h-4 w-4" /> Saving
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default NotificationsForm;
