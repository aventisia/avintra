import { BillingFrequenciesEnum } from "@/react-toolkit/enums/billing-frequencies-enum";
import { CurrencyTypesEnum } from "@/react-toolkit/enums/currency-types-enum";
import { DeploymentTypeEnum } from "@/react-toolkit/enums/deployment-types-enum";
import { PricingComponentsEnum } from "@/react-toolkit/enums/pricing-components-enum";
import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { IconInputFieldProps } from "@/react-toolkit/ui/form/fields/IconInputField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { getSearchOptionsForAsyncSelect } from "@/react-toolkit/utils";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

import { searchTenantsToSelect } from "../../tenants-table/apis/tenants-table-apis";

// PricingPlan Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Id",
  disabled: true,
};

export const tenantSelectProps: AsyncSelectFieldProps = {
  name: "tenantId",
  selectOptions: (search?: string) =>
    searchTenantsToSelect(search).then((data) => data.data),
  label: "Tenant Name",
  placeholder: "Select tenant",
  className: "!w-[28rem]",
  triggerClassName: "!w-full",
  size: "base",
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

export const currencyTypeProps: AsyncSelectFieldProps = {
  name: "currency",
  label: "",
  size: "base",
  placeholder: "Currency",

  isRequired: true,
  selectOptions: (search) =>
    getSearchOptionsForAsyncSelect(enumToArray(CurrencyTypesEnum), search),
  triggerClassName: "rounded-l-none",
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
