import { DeliveryChannelEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateNotificationSettings } from "../apis/tenant-info-apis";
import { notificationSettingsSchema } from "../constants/notification-settings-zod-schema";
import { NotificationSettingsDto } from "../dtos/notification-settings-dto";
import { useFetchNotificationSettings } from "./useFetchNotificationSettings";

export const useDefineNotificationSettingsForm = () => {
  const queryClient = useQueryClient();

  // Fetch existing notification settings
  const { data, isLoading } = useFetchNotificationSettings();

  // Initialize form with validation and default values
  const form = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      lowCredits: true,
      subscription: true,
      publishAgent: true,
      subscriptionRenewalReminderDays: 7,
      lowCreditThreshold: 1000,
      deliveryChannel: DeliveryChannelEnum.Both,
    },
  });

  // Populate form when data is available
  useEffect(() => {
    if (data?.data) {
      form.reset({
        lowCredits: data.data.lowCredits,
        subscription: data.data.subscription,
        publishAgent: data.data.publishAgent,
        subscriptionRenewalReminderDays: data.data.subscriptionRenewalReminderDays,
        lowCreditThreshold: data.data.lowCreditThreshold,
        deliveryChannel: data.data.deliveryChannel,
      });
    }
  }, [data?.data]);

  // Handle form submission. The full settings object is sent; the backend applies and
  // validates it (numeric configuration must be greater than zero).
  const { mutate, isPending } = useMutation({
    mutationFn: (formData: z.infer<typeof notificationSettingsSchema>) =>
      updateNotificationSettings(formData as NotificationSettingsDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["TENANT_NOTIFICATION_SETTINGS"] });
      toast.success("Notification settings updated successfully.");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Form state helpers
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Expose form and related state
  return {
    form,
    isSubmitting,
    isDirty,
    isLoading,
    isPending,
    mutate,
  };
};
