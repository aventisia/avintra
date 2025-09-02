import { organizationNameProps } from "@/features/sign-up/constants/company-form-field-props";
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
import { useChoosePlanStore } from "../../stores/choose-plan-store";

/**
 * Component for the billing form.
 */
export const BillingForm = () => {
  const { form, isSubmitting } = useDefineBillingInfoForm();

  const { setStepNo, setBillingData } = useChoosePlanStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setBillingData: state.setBillingData,
    })),
  );

  const onSubmit = (formData: z.infer<typeof billingInfoSchema>) => {
    console.log(formData);
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
      {/* GST Filing Consent */}
      {applyGST && <SwitchField {...gstRegistrationProps} />}{" "}
      {/* Additional validation field */}
      {applyGST && isGSTRegistered && <InputField {...gstNumberProps} />}
      {/* Address Line 1 */}
      <InputField {...organizationNameProps} />
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
        <SubmitButton isPending={false} primaryText="Continue" />
      </div>
    </Form>
  );
};
