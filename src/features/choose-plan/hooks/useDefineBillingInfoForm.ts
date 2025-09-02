import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { billingInfoSchema } from "../constants/billing-info-zod-schema";
import { useChoosePlanStore } from "../stores/choose-plan-store";

export const useDefineBillingInfoForm = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { billingData } = useChoosePlanStore(
    useShallow((state) => ({
      billingData: state.billingData,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof billingInfoSchema>>({
    resolver: zodResolver(billingInfoSchema),
    defaultValues: {
      organizationName:
        billingData?.organizationName ?? userSession?.tenantName ?? "",
      addressLine1: billingData?.addressLine1 ?? "",
      addressLine2: billingData?.addressLine2 ?? "",
      city: billingData?.city ?? "",
      state: billingData?.state ?? "",
      gstRegistration: billingData?.gstRegistration ?? false,
      country: billingData?.country ?? "India",
      gstNumber: billingData?.gstNumber ?? "",
      pinCode: billingData?.pinCode ?? "",
    },
  });
  console.log(form.formState.errors);
  // Destructor form values and methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
  };
};
