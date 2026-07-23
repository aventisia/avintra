import { toast } from "@avplatform/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateTenantPreferences } from "../apis/tenant-info-apis";
import { preferencesSchema } from "../constants/tenant-preferences-zod-schema";
import { useFetchTenantPreferences } from "./useFetchTenantPreferences";

export const useDefinePreferencesForm = () => {
  const queryClient = useQueryClient();

  // Fetch existing preferences
  const { data, isLoading } = useFetchTenantPreferences();

  // Initialize form with validation and default values
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      id: "",
      tenantName: "",
      isSSOEnabled: false,
      isPwdEnabled: false,
      isPwdNeverExpiresEnabled: false,
      isTwoFAEnabled: false,
      isIdleSessionTimeoutEnabled: false,
      daysBeforePwdExpires: 730,
      idleSessionTimeoutMinutes: 10,
    },
  });

  // Populate form when data is available
  useEffect(() => {
    if (data?.data) {
      form.reset(data.data);
    }
  }, [data?.data]);

  // Handle form submission
  const { mutate, isPending } = useMutation({
    mutationFn: updateTenantPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["TENANT_PREFERENCES"] });
      toast.success("Preferences updated successfully.");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Form state helpers
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Watch specific fields for conditional UI logic
  const isIdleSessionTimeoutEnabled = form.watch("isIdleSessionTimeoutEnabled");
  const isPwdNeverExpiresEnabled = form.watch("isPwdNeverExpiresEnabled");

  // Expose form and related state
  return {
    form,
    isSubmitting,
    isDirty,
    isLoading,
    isPending,
    mutate,
    isIdleSessionTimeoutEnabled,
    isPwdNeverExpiresEnabled,
  };
};
