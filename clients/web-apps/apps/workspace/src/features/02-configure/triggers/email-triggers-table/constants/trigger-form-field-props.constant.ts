import {
  type DateTimePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { EmailTriggerProviderEnum } from "../enums/trigger-frequency-provider-enum";

const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Unique name",
  placeholder: "e.g. Invoice inbox",
  isRequired: true,
  description:
    "Specify a **unique** name for this trigger.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Cannot be changed** after creation.",
};

const providerProps: SelectFieldProps = {
  name: "provider",
  label: "Provider",
  isRequired: true,
  selectOptions: enumToArray(EmailTriggerProviderEnum),
  description: "Email provider. Cannot be changed after creation.",
};

const credentialProps: Omit<SelectFieldProps, "selectOptions"> = {
  name: "credentialName",
  label: "Credential",
  placeholder: "Select a credential",
  isRequired: true,
  description:
    "Vault credential used to connect to the provider. Cannot be changed after creation.",
};

const mailboxProps: InputFieldProps = {
  name: "mailbox",
  type: "email",
  label: "Mailbox",
  placeholder: "e.g. invoices@company.com",
  isRequired: true,
  description: "Email address of the mailbox to watch. Cannot be changed after creation.",
};

const folderProps: InputFieldProps = {
  name: "folder",
  label: "Folder",
  placeholder: "e.g. Inbox",
  description: "Mail folder to watch. Cannot be changed after creation.",
};

const timezoneLabelProps = {
  label: "Timezone",
  description: "Timezone used to calculate the subscription expiry.",
  isRequired: true,
};

const resubscribeFrequencyProps: InputFieldProps = {
  name: "resubscribeFrequency",
  label: "Subscription period (minutes)",
  placeholder: "e.g. 4320",
  isRequired: true,
  description:
    "Subscription duration in minutes (1-4320). Microsoft 365 subscriptions expire after a maximum of 3 days.",
};

const expiryDateTimeProps: DateTimePickerFieldProps = {
  name: "expiryDateTime",
  label: "Expires on",
  description: "Calculated from the timezone and subscription period.",
  isRequired: true,
  granularity: "minute",
};

const agentsLabelProps = {
  label: "Agents",
  description: "Agents to run when an email arrives.",
  isRequired: true,
};

const LOCKED_AGENTS_DESCRIPTION = "Agents cannot be changed after creation.";

const resubscribeEnabledProps: SwitchFieldProps = {
  name: "resubscribeEnabled",
  label: "Resubscribe",
  description: "Renew the subscription before it expires to keep receiving emails.",
  defaultChecked: false,
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable trigger",
  description: "Turn it off when it’s not needed or should be paused.",
};

export {
  agentsLabelProps,
  credentialProps,
  expiryDateTimeProps,
  folderProps,
  isDisabledProps,
  LOCKED_AGENTS_DESCRIPTION,
  mailboxProps,
  nameProps,
  providerProps,
  resubscribeEnabledProps,
  resubscribeFrequencyProps,
  timezoneLabelProps,
};
