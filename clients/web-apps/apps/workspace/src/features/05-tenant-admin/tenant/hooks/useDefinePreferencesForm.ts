import { toast } from "@avplatform/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateTenantPreferences } from "../apis/tenant-info-apis";
import { preferencesSchema } from "../constants/tenant-preferences-zod-schema";
import { buildPreferencesFormValues } from "../utils/tenant-preferences-form-values.util";
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
    if (!data?.data) return;
    // IMPORTANT NOTE: a background refetch must not discard an unsaved edit.
    if (!form.formState.isDirty) form.reset(buildPreferencesFormValues(data.data));
  }, [data?.data]);

  // Handle form submission
  const { mutate: updatePreferences, isPending } = useMutation({
    mutationFn: updateTenantPreferences,
    onSuccess: (response) => {
      form.reset(buildPreferencesFormValues(response.data));
      queryClient.invalidateQueries({ queryKey: ["TENANT_PREFERENCES"] });
      toast.success("Preferences updated successfully.");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  const mutate = (formData: z.infer<typeof preferencesSchema>) => {
    updatePreferences(formData);
  };

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
