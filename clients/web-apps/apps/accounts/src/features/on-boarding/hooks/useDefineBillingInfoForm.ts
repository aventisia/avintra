import { useUserSessionStore } from "@avplatform/ui/stores";
import { isTenantSetupPending } from "@avplatform/ui/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { COUNTRY_LS_KEY } from "@/constants/variables";

import { billingInfoSchema } from "../constants/billing-info-zod-schema";
import { getParsedBillingFromStorage, isIndividualTenant } from "../utils";

export const useDefineBillingInfoForm = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isSetupPending = isTenantSetupPending(userSession);

  const isIndividualUser = isIndividualTenant(userSession);

  const storedData: Partial<z.infer<typeof billingInfoSchema>> = getParsedBillingFromStorage(
    userSession?.tenantId,
  );

  const storedCountryData =
    typeof window !== "undefined" ? localStorage.getItem(COUNTRY_LS_KEY) : null;

  const disableCountryDD = !!storedCountryData;

  const organizationType = isSetupPending
    ? "Organization"
    : (storedData.organizationType ?? (isIndividualUser ? "Individual" : "Organization"));
  const organizationName =
    storedData.organizationName ??
    (isIndividualUser || isSetupPending ? "" : (userSession?.tenantName ?? ""));
  const form = useForm<z.infer<typeof billingInfoSchema>>({
    resolver: zodResolver(billingInfoSchema),
    resetOptions: { keepDirtyValues: true },
    values: {
      organizationType,
      organizationName,
      firstName: storedData.firstName ?? userSession?.firstName ?? "",
      lastName: storedData.lastName ?? userSession?.lastName ?? "",
      addressLine1: storedData.addressLine1 ?? "",
      addressLine2: storedData.addressLine2 ?? "",
      city: storedData.city ?? "",
      state: storedData.state ?? "",
      isWillingToFileGst: storedData.isWillingToFileGst ?? false,
      country: storedCountryData ?? storedData.country ?? "India",
      gstNumber: storedData.gstNumber ?? "",
      postalCode: storedData.postalCode ?? "",
    },
  });

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    isSetupPending,
    isIndividualUser,
    disableCountryDD,
  };
};
