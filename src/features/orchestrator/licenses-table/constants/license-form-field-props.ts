import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";

import { InputFieldProps } from "@aventisia/ui/form";

import { getLicensesToSelect } from "../apis/licenses-table-apis";

// License Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "License Id",
  disabled: true,
};

export const licenseSelectProps: AsyncSelectFieldProps = {
  name: "planId",
  selectOptions: () => getLicensesToSelect().then((data) => data.data),
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
