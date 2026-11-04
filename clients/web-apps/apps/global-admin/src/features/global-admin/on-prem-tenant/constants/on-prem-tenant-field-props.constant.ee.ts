import {
  type DateTimePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { OnPremTenantTypes } from "../enums/on-prem-tenant-type-enum.ee";

const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Name",
  isRequired: true,
  placeholder: "e.g. Acme Corporation",
  description:
    "The tenant's name.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Can be changed** after creation.",
};

const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  isRequired: true,
  description: "The on-premises tenant type.",
  selectOptions: enumToArray(OnPremTenantTypes),
};

const executionTimeAllowedProps: InputFieldProps = {
  name: "executionTimeAllowed",
  label: "Execution hours allowed",
  isRequired: true,
  inputMode: "numeric",
  placeholder: "e.g. 1000",
  description: "The number of hours executions are allowed.",
};

const contractStartDateProps: DateTimePickerFieldProps = {
  name: "contractStartDate",
  label: "Contract start",
  isRequired: true,
  description: "When the contract starts.",
  granularity: "minute",
};

const contractRenewalDateProps: DateTimePickerFieldProps = {
  name: "contractRenewalDate",
  label: "Contract renewal",
  isRequired: true,
  description: "When the contract renews.",
  granularity: "minute",
};

const ourEmailsProps: InputFieldProps = {
  name: "ourEmails",
  label: "Aventisia contacts",
  isRequired: true,
  placeholder: "e.g. accounts@aventisia.com; support@aventisia.com",
  description: "One or more email addresses, separated by semicolons (;).",
};

const tenantEmailsProps: InputFieldProps = {
  name: "tenantEmails",
  label: "Client contacts",
  isRequired: true,
  placeholder: "e.g. it@acme.com; finance@acme.com",
  description: "One or more email addresses, separated by semicolons (;).",
};

const isSsoAllowedProps: SwitchFieldProps = {
  name: "isSsoAllowed",
  label: "Allow single sign-on",
  description:
    "Let the tenant use the company's single sign-on. Takes up to about 24 hours to apply.",
};

const isBrandingAllowedProps: SwitchFieldProps = {
  name: "isBrandingAllowed",
  label: "Allow custom branding",
  description: "Let the tenant use its own brand values. Takes up to about 24 hours to apply.",
};

const isExecutionDisabledProps: SwitchFieldProps = {
  name: "isExecutionDisabled",
  label: "Disable execution",
  description: "Stop all executions for the tenant.",
};

const isLoginDisabledProps: SwitchFieldProps = {
  name: "isLoginDisabled",
  label: "Disable login",
  description: "Block every user of the tenant from signing in.",
};

export {
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
