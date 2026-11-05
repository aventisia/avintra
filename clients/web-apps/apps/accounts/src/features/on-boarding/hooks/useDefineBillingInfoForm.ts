import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { billingInfoSchema } from "../constants/billing-info-zod-schema";
import { useChoosePlanStore } from "../stores/choose-plan-store";
import { getParsedBillingFromStorage, isIndividualTenant } from "../utils";

export const useDefineBillingInfoForm = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isIndividualUser = isIndividualTenant(userSession);

  const { billingData } = useChoosePlanStore(
    useShallow((state) => ({
      billingData: state.billingData,
    })),
  );

  // Try loading from localStorage
  const storedBillingData = getParsedBillingFromStorage(userSession?.tenantId);

  const storedCountryData = typeof window !== "undefined" ? localStorage.getItem("country") : null;

  let parsedStoredData: Partial<z.infer<typeof billingInfoSchema>> = {};

  if (storedBillingData) {
    try {
      parsedStoredData = JSON.parse(storedBillingData);
    } catch (e) {
      console.warn(e, "Invalid local storage data for billingInfo");
    }
  }

  const disableCountryDD = !!storedCountryData;

  // Define form with zod schema
  const form = useForm<z.infer<typeof billingInfoSchema>>({
    resolver: zodResolver(billingInfoSchema),
    defaultValues: {
      organizationType:
        billingData?.organizationType ??
        parsedStoredData.organizationType ??
        (isIndividualUser ? "Individual" : "Organization"),
      organizationName:
        billingData?.organizationName ??
        parsedStoredData.organizationName ??
        (isIndividualUser ? "" : (userSession?.tenantName ?? "")),
      firstName:
        billingData?.firstName ?? parsedStoredData.firstName ?? userSession?.firstName ?? "",
      lastName: billingData?.lastName ?? parsedStoredData.lastName ?? userSession?.lastName ?? "",
      addressLine1: billingData?.addressLine1 ?? parsedStoredData.addressLine1 ?? "",
      addressLine2: billingData?.addressLine2 ?? parsedStoredData.addressLine2 ?? "",
      city: billingData?.city ?? parsedStoredData.city ?? "",
      state: billingData?.state ?? parsedStoredData.state ?? "",
      isWillingToFileGst:
        billingData?.isWillingToFileGst ?? parsedStoredData.isWillingToFileGst ?? false,
      country: storedCountryData ?? billingData?.country ?? parsedStoredData.country ?? "India",
      gstNumber: billingData?.gstNumber ?? parsedStoredData.gstNumber ?? "",
      postalCode: billingData?.postalCode ?? parsedStoredData.postalCode ?? "",
    },
  });

  // Destructor form values and methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    isIndividualUser,
    disableCountryDD,
  };
};
