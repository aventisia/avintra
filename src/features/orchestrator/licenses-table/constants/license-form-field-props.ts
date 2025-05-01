import {
  getPricingPlansToSelectForTenant
} from "@/features/sa/pricing-table/apis/pricingPlans-table-apis"
import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField"
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField"

// License Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "License Id",
  disabled: true,
};

export const licenseSelectProps: AsyncSelectFieldProps = {
  name: "planId",
  selectOptions: () =>
    getPricingPlansToSelectForTenant().then((data) => data.data),
  label: "License Type",
  placeholder: "Select License",
  className: "!w-[30rem]",
  triggerClassName: "!w-full",
  size: "base",
  isRequired: true,
};

// New Allocated Units
export const additionalUnitsRequestedProps: InputFieldProps = {
  name: "additionalUnitsRequested",
  label: "New Allocated Units",
  isRequired: true,
  placeholder: "8",
};
