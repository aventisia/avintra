import {
  type DateTimePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { OnPremTenantTypes } from "../enums/on-prem-tenant-type-enum.ee";

// Tenant Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Tenant ID",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Name",
  isRequired: true,
  description:
    "The tenant's name.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Can be changed** after creation.",
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  isRequired: true,
  description: "The on-premises tenant type.",
  selectOptions: enumToArray(OnPremTenantTypes),
};

// Execution Time Allowed
const executionTimeAllowedProps: InputFieldProps = {
  name: "executionTimeAllowed",
  label: "Execution time allowed (in hours)",
  isRequired: true,
  description: "The number of hours executions are allowed.",
};

// Contract Start Date
const contractStartDateProps: DateTimePickerFieldProps = {
  name: "contractStartDate",
  label: "Contract start date",
  isRequired: true,
  description: "When the contract starts.",
  granularity: "minute",
};

// Contract Renewal Date
const contractRenewalDateProps: DateTimePickerFieldProps = {
  name: "contractRenewalDate",
  label: "Contract renewal date",
  isRequired: true,
  description: "When the contract renews.",
  granularity: "minute",
};

// Name
const ourEmailsProps: InputFieldProps = {
  name: "ourEmails",
  label: "Aventisia emails",
  description: "Enter one or more email addresses separated by semicolons (;)",
  isRequired: true,
};

// Name
const tenantEmailsProps: InputFieldProps = {
  name: "tenantEmails",
  label: "Client emails",
  description: "Enter one or more email addresses separated by semicolons (;)",
  isRequired: true,
};

// Disable Execution
const isExecutionDisabledProps: SwitchFieldProps = {
  name: "isExecutionDisabled",
  label: "Disable execution",
  description: "Disable executions for the tenant",
};

// Disable Login
const isLoginDisabledProps: SwitchFieldProps = {
  name: "isLoginDisabled",
  label: "Disable login",
  description: "Disable login for the tenant",
};

// Allow Single Sign-On
const isSsoAllowedProps: SwitchFieldProps = {
  name: "isSsoAllowed",
  label: "Allow Single Sign-On",
  description:
    "Let the tenant use the company's single sign-on. Takes up to about 24 hours to apply.",
};

// Allow Custom Branding
const isBrandingAllowedProps: SwitchFieldProps = {
  name: "isBrandingAllowed",
  label: "Allow Custom Branding",
  description: "Let the tenant use its own brand values. Takes up to about 24 hours to apply.",
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
  isSsoAllowedProps,
  isBrandingAllowedProps,
  ourEmailsProps,
  tenantEmailsProps,
};
