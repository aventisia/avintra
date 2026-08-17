import { DeliveryChannelEnum } from "@avplatform/ui/enums";
import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { ISelectOption } from "@avplatform/ui/types";
import { useWatch } from "react-hook-form";
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

  // Watch the toggle states so the numeric configuration inputs appear only
  // when the corresponding notification type is enabled.
  const lowCreditsEnabled = useWatch({ control: form.control, name: "lowCredits" });
  const subscriptionEnabled = useWatch({ control: form.control, name: "subscription" });

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
      className="space-y-5"
    >
      {/* Delivery channel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Delivery Channel</CardTitle>
          <CardDescription>
            Choose how automatic notifications are delivered to recipients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelectField {...deliveryChannelProps} selectOptions={deliveryChannelOptions} />
        </CardContent>
      </Card>

      {/* Notification types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notification Types</CardTitle>
          <CardDescription>
            Enable or disable each automatic notification type for this tenant. All types are
            turned on by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <SwitchField {...lowCreditsProps} />
            {lowCreditsEnabled && <InputField {...lowCreditThresholdProps} />}
          </div>

          <div className="space-y-3">
            <SwitchField {...subscriptionProps} />
            {subscriptionEnabled && <InputField {...subscriptionRenewalReminderDaysProps} />}
          </div>

          <SwitchField {...publishAgentProps} />
        </CardContent>
      </Card>

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
