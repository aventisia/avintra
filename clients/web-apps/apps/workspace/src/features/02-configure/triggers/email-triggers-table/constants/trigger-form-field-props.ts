import {
  type DateTimePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { EmailTriggerProviderEnum } from "../enums/trigger-frequency-provider-enum";

// trigger Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Trigger Id",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Unique Name",
  isRequired: true,
  description:
    "Specify a **unique** name for this trigger.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Can be changed** after creation.",
};

// Name
const mailboxProps: InputFieldProps = {
  name: "mailbox",
  type: "email",
  label: "Account Id",
  isRequired: true,
  description: "Enter the mail id",
};

const folderProps: InputFieldProps = {
  name: "folder",
  label: "Folder",
  description: "Enter Folder",
};

const expiryDateTimeProps: DateTimePickerFieldProps = {
  name: "expiryDateTime",
  label: "Expiry Date & Time",
  description: "The date and time when the trigger will expire.",
  isRequired: true,
  granularity: "minute",
};

const resubscribeEnabledProps: SwitchFieldProps = {
  name: "resubscribeEnabled",
  label: "Resubscribe",
  description: "Enable to maintain continuous connectivity and prevent subscription expiry.",
  defaultChecked: false,
};

const resubscribeFrequencyProps: InputFieldProps = {
  name: "resubscribeFrequency",
  label: "Subscription Period (in minutes)",
  isRequired: true,
  description:
    "Enter the subscription duration in minutes (1-4320). Microsoft 365 subscriptions expire after a maximum of 3 days.",
};

const credentialNameProps: InputFieldProps = {
  name: "credentialName",
  label: "Credential Name",
  description: "CredentialName",
  isRequired: true,
};

const providerProps: SelectFieldProps = {
  name: "provider",
  label: "Provider",
  isRequired: true,
  selectOptions: enumToArray(EmailTriggerProviderEnum),
  description: "Email provider.",
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Trigger",
  description: "Disable the trigger when it's not needed or should be temporarily turned off.",
};

export {
  idProps,
  nameProps,
  mailboxProps,
  folderProps,
  expiryDateTimeProps,
  resubscribeEnabledProps,
  resubscribeFrequencyProps,
  credentialNameProps,
  providerProps,
  isDisabledProps,
};
