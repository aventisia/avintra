import { toast } from "@avplatform/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateNotificationSettings } from "../apis/tenant-info-apis";
import { notificationSettingsSchema } from "../constants/notification-settings-zod-schema";
import { UpdateNotificationSettingsDto } from "../dtos/update-notification-settings-dto";
import { useFetchNotificationSettings } from "./useFetchNotificationSettings";

export const useDefineNotificationSettingsForm = () => {
  const queryClient = useQueryClient();

  // Fetch existing notification settings
  const { data, isLoading } = useFetchNotificationSettings();

  // Initialize form with validation and default values
  const form = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      lowCredits: false,
      subscription: false,
      publishAgent: false,
    },
  });

  // Populate form when data is available
  useEffect(() => {
    if (data?.data) {
      form.reset({
        lowCredits: data.data.lowCredits,
        subscription: data.data.subscription,
        publishAgent: data.data.publishAgent,
      });
    }
  }, [data?.data]);

  // Build a partial update payload containing only the fields that changed, so that
  // changing one setting does not unintentionally modify the others (partial update).
  const buildUpdateDto = (
    formData: z.infer<typeof notificationSettingsSchema>,
  ): UpdateNotificationSettingsDto => {
    const original = data?.data;
    const updateDto: UpdateNotificationSettingsDto = {};

    if (original && formData.lowCredits !== original.lowCredits) {
      updateDto.lowCredits = formData.lowCredits;
    }
    if (original && formData.subscription !== original.subscription) {
      updateDto.subscription = formData.subscription;
    }
    if (original && formData.publishAgent !== original.publishAgent) {
      updateDto.publishAgent = formData.publishAgent;
    }

    return updateDto;
  };

  // Handle form submission
  const { mutate, isPending } = useMutation({
    mutationFn: (formData: z.infer<typeof notificationSettingsSchema>) =>
      updateNotificationSettings(buildUpdateDto(formData)),
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
