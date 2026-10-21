import { toast } from "@avplatform/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { SsoDisableWarningDto } from "../dtos/sso-disable-warning-dto";
import { updateTenantPreferences } from "../apis/tenant-info-apis";
import { preferencesSchema } from "../constants/tenant-preferences-zod-schema";
import { useFetchTenantPreferences } from "./useFetchTenantPreferences";
import { parseSsoConfig } from "@/features/05-tenant-admin/tenant/utils/sso-config-summary.util";

export const useDefinePreferencesForm = () => {
  const queryClient = useQueryClient();

  // Fetch existing preferences
  const { data, isLoading } = useFetchTenantPreferences();

  const ssoConfigSummary = parseSsoConfig(data?.data?.ssoConfigJson);
  const isSsoConnected = Boolean(ssoConfigSummary.externalTenantId);

  // Warning returned by the last disable attempt
  const [ssoDisableWarning, setSsoDisableWarning] = useState<SsoDisableWarningDto | undefined>(undefined);

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
      setSsoDisableWarning(data.data.ssoDisableWarning);
    }
  }, [data?.data]);

  // Handle form submission
  const { mutate: updatePreferences, isPending } = useMutation({
    mutationFn: updateTenantPreferences,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["TENANT_PREFERENCES"] });
      setSsoDisableWarning(response?.data?.ssoDisableWarning);
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
  const isSSOEnabled = form.watch("isSSOEnabled");

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
    isSSOEnabled,
    isSsoConnected,
    ssoDisableWarning,
  };
};
