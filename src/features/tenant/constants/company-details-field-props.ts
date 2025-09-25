import { CountriesEnum } from "@aventisia/ui/enums";
import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const organizationNameProps: InputFieldProps = {
  name: "organizationName",
  label: "Organization Name",
  isRequired: true,
};

const billingEmailProps: InputFieldProps = {
  name: "billingEmail",
  label: "Billing Email",
  isRequired: true,
};

const contactPersonProps: InputFieldProps = {
  name: "contactPerson",
  label: "Contact Person",
  isRequired: true,
};

const addressLine1Props: InputFieldProps = {
  name: "addressLine1",
  label: "Address Line 1",
  isRequired: true,
};

const addressLine2Props: InputFieldProps = {
  name: "addressLine2",
  label: "Address Line 2",
};

const cityProps: InputFieldProps = {
  name: "city",
  label: "City",
  isRequired: true,
};

const postalCodeProps: InputFieldProps = {
  name: "postalCode",
  label: "Pin Code",
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
  label: "GST Number",
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
