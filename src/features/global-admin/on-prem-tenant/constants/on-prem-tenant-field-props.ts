import {
  DatePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { OnPremTenantTypes } from "../enums/on-prem-tenant-type-enum";

// Tenant Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Tenant Id",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Name",
  isRequired: true,
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  isRequired: true,
  selectOptions: enumToArray(OnPremTenantTypes),
};

// Execution Time Allowed
const executionTimeAllowedProps: InputFieldProps = {
  name: "executionTimeAllowed",
  label: "Execution Time Allowed (in Hours)",
  isRequired: true,
};

// Contract Start Date
const contractStartDateProps: DatePickerFieldProps = {
  name: "contractStartDate",
  label: "Contract Start Date",
  isRequired: true,
};

// Contract Renewal Date
const contractRenewalDateProps: DatePickerFieldProps = {
  name: "contractRenewalDate",
  label: "Contract Renewal Date",
  isRequired: true,
};

// Name
const ourEmailsProps: InputFieldProps = {
  name: "ourEmails",
  label: "Aventisia Emails",
  description: "Enter one or more email addresses separated by semicolons (;)",
  isRequired: true,
};

// Name
const tenantEmailsProps: InputFieldProps = {
  name: "tenantEmails",
  label: "Client Emails",
  description: "Enter one or more email addresses separated by semicolons (;)",
  isRequired: true,
};

// Disable Execution
const isExecutionDisabledProps: SwitchFieldProps = {
  name: "isExecutionDisabled",
  label: "Disable Execution",
  description: "Disable executions for the tenant",
};

// Disable Login
const isLoginDisabledProps: SwitchFieldProps = {
  name: "isLoginDisabled",
  label: "Disable Login",
  description: "Disable Login for the tenant",
};

export {
  idProps,
  nameProps,
  typeProps,
  executionTimeAllowedProps,
  contractStartDateProps,
  contractRenewalDateProps,
  isExecutionDisabledProps,
  isLoginDisabledProps,
  ourEmailsProps,
  tenantEmailsProps,
};
