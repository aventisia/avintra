import { DatePickerFieldProps } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { LicenseSelectFieldProps } from "@/react-toolkit/ui/form/fields/LicenseSelectField";
import { TenantSelectFieldProps } from "@/react-toolkit/ui/form/fields/TenantSelectField";

// Plan name
export const idProps: TenantSelectFieldProps = {
  name: "id",
  label: "Tenant Name",
  isRequired: true,
};

// Plan name
export const saLicenseTypesProps: LicenseSelectFieldProps = {
  name: "planId",
  label: "License Type",
  isRequired: true,
};

// New Allocated Units
export const additionalUnitsRequestedProps: InputFieldProps = {
  name: "additionalUnitsRequested",
  label: "New Allocated Units",
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
};
