import { BillingFrequenciesEnum } from "@/react-toolkit/enums/billing-frequencies-enum";
import { DeploymentTypeEnum } from "@/react-toolkit/enums/deployment-types-enum";
import { PricingComponentsEnum } from "@/react-toolkit/enums/pricing-components-enum";
import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { getSearchOptionsForAsyncSelect } from "@/react-toolkit/utils";

import { CurrenciesEnum } from "@aventisia/ui/enums";
import { IconInputFieldProps } from "@/react-toolkit/ui/form/fields/IconInputField";
import { InputFieldProps } from "@aventisia/ui/form";
import { RadioCardGroupFieldProps } from "@/react-toolkit/ui/form/fields/RadioCardGroupField";
import { SelectFieldProps } from "@aventisia/ui/form";
import { SwitchFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { searchTenantsToSearchSelect } from "../../tenants-table/apis/tenants-table-apis";

// PricingPlan Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Id",
  disabled: true,
};

export const tenantSelectProps: AsyncSelectFieldProps = {
  name: "tenantId",
  selectOptions: searchTenantsToSearchSelect,
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
export const deploymentTypeProps: RadioCardGroupFieldProps = {
  name: "tenantType",
  label: "Depoyment Type",
  selectOptions: enumToArray(DeploymentTypeEnum),
};

export const currencyTypeProps: AsyncSelectFieldProps = {
  name: "currency",
  label: "Unit Price",
  size: "base",
  placeholder: "Currency",
  getOptionValue: (option) => option.value.toLowerCase(),
  isRequired: true,
  selectOptions: (search) =>
    getSearchOptionsForAsyncSelect(enumToArray(CurrenciesEnum), search),
  triggerClassName: "rounded-r-none w-full",
};
export const unitPriceTypeProps: InputFieldProps = {
  name: "unitPrice",
  label: "",
  isRequired: true,
  placeholder: "99",
};
export const frequencyTypeProps: RadioCardGroupFieldProps = {
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
