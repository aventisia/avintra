import { BillingFrequenciesEnum } from "@/react-toolkit/enums/billing-frequencies-enum";
import { CountriesEnum } from "@/react-toolkit/enums/countries-enum";
import { PricingComponentsEnum } from "@/react-toolkit/enums/pricing-components-enum";
import { TenantTypeEnum } from "@/react-toolkit/enums/tenant-types-enum";
import { IconInputFieldProps } from "@/react-toolkit/ui/form/fields/IconInputField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

// PricingPlan Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "PricingPlan Id",
  disabled: true,
};

export const pricingComponentTypeProps: SelectFieldProps = {
  name: "pricingComponent",
  label: "Pricing Component",
  isRequired: true,
  selectOptions: enumToArray(PricingComponentsEnum),
};
export const tenantTypeTypeProps: SelectFieldProps = {
  name: "tenantType",
  label: "Tenant Type",
  isRequired: true,
  selectOptions: enumToArray(TenantTypeEnum),
};
export const tenantNameTypeProps: SelectFieldProps = {
  name: "tenantName",
  label: "Tenant Name",
  isRequired: true,
  selectOptions: [],
};
export const currencyTypeProps: SelectFieldProps = {
  name: "currency",
  label: "Currency",
  isRequired: true,
  selectOptions: enumToArray(CountriesEnum),
};
export const unitTypeProps: SelectFieldProps = {
  name: "unit",
  label: "Unit",
  isRequired: true,
  selectOptions: [],
};
export const unitPriceTypeProps: InputFieldProps = {
  name: "unitPrice",
  label: "Unit Price",
  isRequired: true,
};
export const billingFrequencyTypeProps: SelectFieldProps = {
  name: "billingFrequency",
  label: "Billing Frequency",
  isRequired: true,
  selectOptions: enumToArray(BillingFrequenciesEnum),
};
export const colaTypeProps: IconInputFieldProps = {
  name: "cola",
  label: "COLA",
  isRequired: true,
  iconProps: {
    icon: "Percent",
    position: "end",
  },
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};
