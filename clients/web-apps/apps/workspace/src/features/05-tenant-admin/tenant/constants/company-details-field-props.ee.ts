import { CountriesEnum } from "@avplatform/ui/enums";
import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

const organizationNameProps: InputFieldProps = {
  name: "organizationName",
  label: "Organization name",
  isRequired: true,
};

const billingEmailProps: InputFieldProps = {
  name: "billingEmail",
  label: "Billing email",
  isRequired: true,
};

const contactPersonProps: InputFieldProps = {
  name: "contactPerson",
  label: "Contact person",
  isRequired: true,
};

const addressLine1Props: InputFieldProps = {
  name: "addressLine1",
  label: "Address line 1",
  isRequired: true,
};

const addressLine2Props: InputFieldProps = {
  name: "addressLine2",
  label: "Address line 2",
};

const cityProps: InputFieldProps = {
  name: "city",
  label: "City",
  isRequired: true,
};

const postalCodeProps: InputFieldProps = {
  name: "postalCode",
  label: "Pin code",
  isRequired: true,
};

const stateProps: InputFieldProps = {
  name: "state",
  label: "State",
  isRequired: true,
};

const countryProps: SelectFieldProps = {
  name: "country",
  label: "Country",
  isRequired: true,
  selectOptions: enumToArray(CountriesEnum),
};

const isWillingToFileGstProps: SwitchFieldProps = {
  name: "isWillingToFileGst",
  label: "Are you GST registered?",
  description: "",
};

const gstNumberProps: InputFieldProps = {
  name: "gstNumber",
  label: "GST number",
  isRequired: true,
};

export {
  organizationNameProps,
  billingEmailProps,
  addressLine1Props,
  addressLine2Props,
  cityProps,
  postalCodeProps,
  stateProps,
  countryProps,
  isWillingToFileGstProps,
  gstNumberProps,
  contactPersonProps,
};
