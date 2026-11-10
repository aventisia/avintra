import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { ScrollArea } from "@avplatform/ui/scroll";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { isTenantSetupPending } from "@avplatform/ui/utils";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { organizationNameProps } from "@/features/on-boarding/constants/company-form-field-props";

import { billingInfoSchema } from "../../constants/billing-info-zod-schema";
import {
  addressLine1Props,
  addressLine2Props,
  cityProps,
  countryProps,
  firstNameProps,
  gstNumberProps,
  gstRegistrationProps,
  lastNameProps,
  organizationTypeProps,
  pinCodeProps,
  stateProps,
} from "../../constants/form-field-props";
import { useDefineBillingInfoForm } from "../../hooks/useDefineBillingInfoForm";
import { useSaveDeferredTenantProfile } from "../../hooks/useSaveDeferredTenantProfile";
import { useChoosePlanStore } from "../../stores/choose-plan-store";
import { getParsedBillingFromStorage, setBillingDataInStorage } from "../../utils";

/**
 * Component for the billing form.
 */
export const BillingForm = () => {
  const { form, isSubmitting, isIndividualUser, disableCountryDD } = useDefineBillingInfoForm();

  const { setStepNo, setBillingData, currency, setCurrency, setPlanId } = useChoosePlanStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setBillingData: state.setBillingData,
      currency: state.currency,
      setCurrency: state.setCurrency,
      setPlanId: state.setPlanId,
    })),
  );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const { saveDeferredTenantProfile } = useSaveDeferredTenantProfile();

  const isSetupPending = isTenantSetupPending(userSession);

  const onSubmit = async (formData: z.infer<typeof billingInfoSchema>) => {
    if (isSetupPending && !(await saveDeferredTenantProfile(formData))) return;

    const existingData = getParsedBillingFromStorage(userSession?.tenantId);

    // Merge old data ( country) with new
    const mergedData = {
      ...existingData,
      ...formData,
    };

    // Save back to localStorage
    setBillingDataInStorage(userSession?.tenantId, mergedData);

    setBillingData({
      ...formData,
    });

    if (formData.country === "India" && currency !== "INR") {
      setCurrency("INR");
      setPlanId("");
      toast.info("Billing in India uses INR pricing. Choose your plan again in INR.");
      setStepNo(1);
      return;
    }

    setStepNo(3);
  };
  const isGSTRegistered = form.watch("isWillingToFileGst");
  const applyGST = form.watch("country") == "India";
  const isOrganization = form.watch("organizationType") === "Organization";

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting}
      className="space-y-4"
    >
      <ScrollArea className="h-[60vh] border rounded-lg  p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
            <InputField {...firstNameProps} />
            <InputField {...lastNameProps} />
          </div>
          {isSetupPending && <SelectField {...organizationTypeProps} />}
          {isSetupPending && isOrganization && <InputField {...organizationNameProps} />}
          {/* GST Filing Consent */}
          {applyGST && <SwitchField {...gstRegistrationProps} />}
          {/* Additional validation field */}
          {applyGST && isGSTRegistered && <InputField {...gstNumberProps} />}
          {/* Existing organization name */}
          {!isIndividualUser && <InputField disabled {...organizationNameProps} />}{" "}
          {/* Address Line 1 */}
          <InputField {...addressLine1Props} />
          {/* Address Line 2 */}
          <InputField {...addressLine2Props} />
          <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
            {/* City */}
            <InputField {...cityProps} />

            {/* Pin Code */}
            <InputField {...pinCodeProps} />
          </div>
          <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2 ">
            {/* State */}
            <InputField {...stateProps} />

            {/* Country */}
            <SelectField disabled={disableCountryDD} {...countryProps} />
          </div>
        </div>
      </ScrollArea>
      <div className="flex w-full justify-between">
        <Button
          size="lg"
          type="button"
          variant={"outline"}
          onClick={() => {
            setStepNo(1);
          }}
        >
          Back
        </Button>
        <SubmitButton size="lg" isPending={false} primaryText="Continue" />
      </div>
    </Form>
  );
};
