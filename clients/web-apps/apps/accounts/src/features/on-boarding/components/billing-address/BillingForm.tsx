import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { ScrollArea } from "@avplatform/ui/scroll";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { organizationNameProps } from "@/features/on-boarding/constants/company-form-field-props";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { billingInfoSchema } from "../../constants/billing-info-zod-schema";
import {
  addressLine1Props,
  addressLine2Props,
  cityProps,
  countryProps,
  gstNumberProps,
  gstRegistrationProps,
  pinCodeProps,
  stateProps,
} from "../../constants/form-field-props";
import { useDefineBillingInfoForm } from "../../hooks/useDefineBillingInfoForm";
import { useChoosePlanStore } from "../../stores/choose-plan-store";
import { getParsedBillingFromStorage, setBillingDataInStorage } from "../../utils";

/**
 * Component for the billing form.
 */
export const BillingForm = () => {
  const { form, isSubmitting, isIndividualUser, disableCountryDD } = useDefineBillingInfoForm();

  const { setStepNo, setBillingData } = useChoosePlanStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      planId: state.planId,
      planFrequency: state.planFrequency,
      setBillingData: state.setBillingData,
    })),
  );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const onSubmit = (formData: z.infer<typeof billingInfoSchema>) => {
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
    setStepNo(3);
  };
  const isGSTRegistered = form.watch("isWillingToFileGst");
  const applyGST = form.watch("country") == "India";

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting}
      className="space-y-4"
    >
      <ScrollArea className="h-[60vh] border rounded-lg  p-4">
        <div className="space-y-4">
          {/* GST Filing Consent */}
          {applyGST && <SwitchField {...gstRegistrationProps} />}
          {/* Additional validation field */}
          {applyGST && isGSTRegistered && <InputField {...gstNumberProps} />}
          {/* Address Line 1 */}
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
          type="button"
          variant={"outline"}
          onClick={() => {
            setStepNo(1);
          }}
        >
          Back
        </Button>
        <SubmitButton isPending={false} primaryText="Continue" />
      </div>
    </Form>
  );
};
