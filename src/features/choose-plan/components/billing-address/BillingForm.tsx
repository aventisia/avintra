import { organizationNameProps } from "@/features/sign-up/constants/company-form-field-props";
import { BILLING_INFO_KEY } from "@/react-toolkit/constants";
import { Form } from "@/react-toolkit/ui/form/Form";

import { Button, SubmitButton } from "@aventisia/ui/buttons";
import { InputField, SelectField, SwitchField } from "@aventisia/ui/form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

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
import { useInsertBillingDetailsMutation } from "../../hooks/useInsertBillingDetailsMutation";
import { useChoosePlanStore } from "../../stores/choose-plan-store";

/**
 * Component for the billing form.
 */
export const BillingForm = () => {
  const { form, isSubmitting, isIndividualUser } = useDefineBillingInfoForm();

  const { planId, planType, setStepNo, setBillingData } = useChoosePlanStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      planId: state.planId,
      planType: state.planType,
      setBillingData: state.setBillingData,
    })),
  );

  const { insetBillingDetailsMutation, isPending } =
    useInsertBillingDetailsMutation();

  const onSubmit = (formData: z.infer<typeof billingInfoSchema>) => {
    let existingData = {};

    try {
      const storedData = localStorage.getItem(BILLING_INFO_KEY);
      if (storedData) {
        existingData = JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Error parsing BILLING_INFO_KEY from localStorage:", error);
    }

    // Merge old data ( country) with new
    const mergedData = {
      ...existingData,
      ...formData,
    };

    // Save back to localStorage
    localStorage.setItem(BILLING_INFO_KEY, JSON.stringify(mergedData));

    setBillingData({
      ...formData,
    });

    insetBillingDetailsMutation({
      addressLine1: formData.addressLine1,
      amount: 0,
      city: formData.city,
      country: formData.country,
      frequency: planType,
      isWillingToFileGst: !!formData.isWillingToFileGst,
      planId: planId,
      postalCode: formData.postalCode,
      state: formData.state,
      taxRate: 18,
      addressLine2: formData.addressLine2,
      gstNumber: formData.gstNumber,
    });
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
      {/* GST Filing Consent */}
      {applyGST && <SwitchField {...gstRegistrationProps} />}
      {/* Additional validation field */}
      {applyGST && isGSTRegistered && <InputField {...gstNumberProps} />}
      {/* Address Line 1 */}
      {!isIndividualUser && (
        <InputField disabled {...organizationNameProps} />
      )}{" "}
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
      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        {/* State */}
        <InputField {...stateProps} />

        {/* Country */}
        <SelectField {...countryProps} />
      </div>
      <div className="flex w-full justify-between">
        <Button
          variant={"outline"}
          onClick={() => {
            setStepNo(1);
          }}
        >
          Back
        </Button>
        <SubmitButton isPending={isPending} primaryText="Continue" />
      </div>
    </Form>
  );
};
