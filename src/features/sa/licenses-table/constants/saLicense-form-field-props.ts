import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

import type { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
// License Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "License Id",
  disabled: true,
};

export const accountTypeProps: SelectFieldProps = {
  name: "accountType",
  label: "Account Type",
  isRequired: true,
  selectOptions: enumToArray(FlowTypesEnum),
};
export const nameProps: SelectFieldProps = {
  name: "name",
  label: "Tenant / User Name",
  isRequired: true,
  selectOptions: enumToArray(FlowTypesEnum),
};
export const pricingComponentProps: SelectFieldProps = {
  name: "pricingComponent",
  label: "Pricing Component",
  isRequired: true,
  selectOptions: enumToArray(FlowTypesEnum),
};
export const unitCostProps: InputFieldProps = {
  name: "unitCost",
  label: "Unit Cost",
  isRequired: true,
};
export const currentQuantityProps: InputFieldProps = {
  name: "currentQuantity",
  disabled: true,
};
export const newQuantityProps: InputFieldProps = {
  name: "newQuantity",
  isRequired: true,
};
export const additionaCostProps: InputFieldProps = {
  name: "additionaCost",
  disabled: true,
};
