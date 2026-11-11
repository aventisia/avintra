import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useWatch } from "react-hook-form";

import {
  addressLine1Props,
  addressLine2Props,
  cityProps,
  countryProps,
  firstNameProps,
  gstNumberProps,
  gstRegistrationProps,
  lastNameProps,
  organizationNameProps,
  pinCodeProps,
  stateProps,
} from "../../constants/form-field-props";

type BillingFieldsProps = {
  isSetupPending: boolean;
  isIndividualUser: boolean;
  disableCountryDD: boolean;
};

export const BillingFields = ({
  isSetupPending,
  isIndividualUser,
  disableCountryDD,
}: BillingFieldsProps) => {
  const [country, isGstRegistered] = useWatch({ name: ["country", "isWillingToFileGst"] });
  const isIndia = country === "India";

  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Billing details</h2>
        <p className="text-sm text-muted-foreground">These appear on your invoice.</p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <InputField {...firstNameProps} />
        <InputField {...lastNameProps} />
        {isSetupPending && (
          <div className="sm:col-span-2">
            <InputField {...organizationNameProps} />
          </div>
        )}
        {!isSetupPending && !isIndividualUser && (
          <div className="sm:col-span-2">
            <InputField disabled {...organizationNameProps} />
          </div>
        )}
        <div className="sm:col-span-2">
          <InputField {...addressLine1Props} />
        </div>
        <div className="sm:col-span-2">
          <InputField {...addressLine2Props} />
        </div>
        <InputField {...cityProps} />
        <InputField {...pinCodeProps} />
        <InputField {...stateProps} />
        <SelectField disabled={disableCountryDD} {...countryProps} />
        {isIndia && (
          <div className="sm:col-span-2">
            <SwitchField {...gstRegistrationProps} />
          </div>
        )}
        {isIndia && isGstRegistered && (
          <div className="sm:col-span-2">
            <InputField {...gstNumberProps} />
          </div>
        )}
      </div>
    </section>
  );
};
