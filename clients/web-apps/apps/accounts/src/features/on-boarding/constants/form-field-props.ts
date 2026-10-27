import { CountriesEnum } from "@avplatform/ui/enums";
import type { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

// First Name
const firstNameProps: InputFieldProps = {
  label: "First Name",
  name: "firstName",
  type: "text",
  isRequired: true,
};

// Last Name
const lastNameProps: InputFieldProps = {
  label: "Last Name",
  name: "lastName",
  type: "text",
  isRequired: true,
};

// Organization Name
const organizationNameProps: InputFieldProps = {
  name: "organizationName",
  label: "Organization Name",
  type: "text",
  isRequired: true,
};

// Pin Code
const pinCodeProps: InputFieldProps = {
  className: "h-control-lg",
  label: "Pin Code",
  name: "postalCode",
  isRequired: true,
};

// Address Line 1
const addressLine1Props: InputFieldProps = {
  className: "h-control-lg",
  name: "addressLine1",
  label: "Address Line 1",
  type: "text",
  isRequired: true,
};

// Address Line 2
const addressLine2Props: InputFieldProps = {
  className: "h-control-lg",
  name: "addressLine2",
  label: "Address Line 2",
  type: "text",
  isRequired: false,
};

// State
const stateProps: InputFieldProps = {
  className: "h-control-lg",
  name: "state",
  label: "State/Province",
  isRequired: true,
};

// City
const cityProps: InputFieldProps = {
  className: "h-control-lg",
  name: "city",
  label: "City",
  type: "text",
  isRequired: true,
};

// Gst Number
const gstNumberProps: InputFieldProps = {
  className: "h-control-lg",
  name: "gstNumber",
  label: "GST Number",
  type: "text",
  isRequired: true,
};
// GST Registration Inquiry
const gstRegistrationProps: SwitchFieldProps = {
  name: "isWillingToFileGst",
  label: "Are you GST registered?",
  description: "",
};

// Country
const countryProps: SelectFieldProps = {
  className: "h-control-lg",
  name: "country",
  label: "Country",
  selectOptions: enumToArray(CountriesEnum),
  isRequired: true,
};

export {
  firstNameProps,
  lastNameProps,
  organizationNameProps,
  pinCodeProps,
  addressLine1Props,
  addressLine2Props,
  stateProps,
  cityProps,
  countryProps,
  gstRegistrationProps,
  gstNumberProps,
};
