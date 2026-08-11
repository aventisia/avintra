import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form, SwitchField } from "@avplatform/ui/form";
import { z } from "zod";

import {
  lowCreditsProps,
  publishAgentProps,
  subscriptionProps,
} from "@/features/05-tenant-admin/tenant/constants/notification-settings-field-props";
import { notificationSettingsSchema } from "@/features/05-tenant-admin/tenant/constants/notification-settings-zod-schema";
import { useDefineNotificationSettingsForm } from "@/features/05-tenant-admin/tenant/hooks/useDefineNotificationSettingsForm";

import TabLoader from "../TabLoader";

const NotificationsForm = () => {
  const { form, isDirty, isSubmitting, isPending, mutate, isLoading } =
    useDefineNotificationSettingsForm();

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
      <SwitchField {...lowCreditsProps} />
      <SwitchField {...subscriptionProps} />
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
