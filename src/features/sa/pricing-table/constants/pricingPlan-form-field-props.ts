import { BillingFrequenciesEnum } from "@/react-toolkit/enums/billing-frequencies-enum";
import { CurrencyTypesEnum } from "@/react-toolkit/enums/currency-types-enum";
import { DeploymentTypeEnum } from "@/react-toolkit/enums/deployment-types-enum";
import { PricingComponentsEnum } from "@/react-toolkit/enums/pricing-components-enum";
import { IconInputFieldProps } from "@/react-toolkit/ui/form/fields/IconInputField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TenantSelectFieldProps } from "@/react-toolkit/ui/form/fields/TenantSelectField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

// PricingPlan Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Id",
  disabled: true,
};

export const pricingComponentTypeProps: SelectFieldProps = {
  name: "pricingComponent",
  label: "Pricing Component",
  isRequired: true,
  selectOptions: enumToArray(PricingComponentsEnum),
};
export const tenantTypeProps: SelectFieldProps = {
  name: "tenantType",
  label: "Tenant Type",
  isRequired: true,
  selectOptions: enumToArray(DeploymentTypeEnum),
};
export const tenantNameProps: TenantSelectFieldProps = {
  name: "tenantId",
  label: "Tenant Name",
};
export const currencyTypeProps: SelectFieldProps = {
  name: "currency",
  label: "Currency",
  isRequired: true,
  selectOptions: enumToArray(CurrencyTypesEnum),
};
export const unitPriceTypeProps: InputFieldProps = {
  name: "unitPrice",
  label: "Unit Price",
  isRequired: true,
  placeholder: "99",
};
export const frequencyTypeProps: SelectFieldProps = {
  name: "frequency",
  label: "Billing Frequency",
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
  placeholder: "2",
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Plan",
  description: "Disable this plan if it's been outdated, or not in use anymore",
};
