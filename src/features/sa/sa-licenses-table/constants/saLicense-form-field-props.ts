import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { DatePickerFieldProps } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";

import { searchTenantsToSelect } from "../../tenants-table/apis/tenants-table-apis";

// New Allocated Units
export const additionalUnitsRequestedProps: InputFieldProps = {
  name: "additionalUnitsRequested",
  label: "New Allocated Units",
  isRequired: true,
  placeholder: "8",
};

export const tenantSelectProps: AsyncSelectFieldProps = {
  name: "id",
  selectOptions: (search?: string) =>
    searchTenantsToSelect(search).then((data) => data.data),
  label: "Tenant Name",
  placeholder: "Select tenant",
  className: "!w-[30rem]",
  triggerClassName: "!w-full",
  size: "base",
  isRequired: true,
};

export const licenseSelectProps: AsyncSelectFieldProps = {
  name: "planId",
  selectOptions: () => Promise.resolve([]),
  label: "License Type",
  placeholder: "Select License",
  className: "!w-[30rem]",
  triggerClassName: "!w-full",
  size: "base",
  isRequired: true,
};

export const dateReceivedProps: DatePickerFieldProps = {
  name: "dateReceived",
  label: "Date Received",
  isRequired: true,
};

export const amountReceivedProps: InputFieldProps = {
  name: "amountReceived",
  label: "Amount Received",
  isRequired: true,
  placeholder: "9999.99",
};
