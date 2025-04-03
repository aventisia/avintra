import { CountriesEnum } from "@/react-toolkit/enums/countries-enum";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

// BillingPlan Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "BillingPlan Id",
  disabled: true,
};
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Full Name",
  isRequired: true,
};

export const emailProps: InputFieldProps = {
  name: "email",
  label: "Email",
  isRequired: true,
};

export const addressLine1Props: InputFieldProps = {
  name: "addressLine1",
  label: "Address Line 1",
  isRequired: true,
};
export const addressLine2Props: InputFieldProps = {
  name: "addressLine2",
  label: "Address Line 2",
  isRequired: true,
};
export const addressLine3Props: InputFieldProps = {
  name: "addressLine3",
  label: "Address Line 3",
};
export const pinCodeProps: InputFieldProps = {
  name: "pinCode",
  label: "Pin Code",
  isRequired: true,
};
export const cityProps: InputFieldProps = {
  name: "city",
  label: "City",
  isRequired: true,
};
export const stateProps: InputFieldProps = {
  name: "state",
  label: "State",
  isRequired: true,
};
export const countryProps: SelectFieldProps = {
  name: "country",
  label: "Country",
  isRequired: true,
  selectOptions: enumToArray(CountriesEnum),
};
export const taxIdProps: InputFieldProps = {
  name: "taxId",
  label: "Tax Id",
};
// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};
