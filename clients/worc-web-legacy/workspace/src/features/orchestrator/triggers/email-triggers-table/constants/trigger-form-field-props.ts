import {
  DatePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

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
  label: "Name",
  isRequired: true,
  description: "Specify a name for this trigger.",
};

// Name
const mailboxProps: InputFieldProps = {
  name: "mailbox",
  type: "email",
  label: "Account",
  isRequired: true,
  description: "Enter the mail id",
};

const folderProps: InputFieldProps = {
  name: "folder",
  label: "Folder",
  description: "Enter Folder",
};

const expiryDateTimeProps: DatePickerFieldProps = {
  name: "expiryDateTime",
  label: "Expiry Date",
  description: "The date when the trigger will expire.",
  isRequired: true,
};

const resubscribeEnabledProps: SwitchFieldProps = {
  name: "resubscribeEnabled",
  label: "Resubscribe",
  description:
    "Enables to resubscribe automatically after their subscription has been canceled.",
  defaultChecked: false,
};

const resubscribeFrequencyProps: SelectFieldProps = {
  name: "resubscribeFrequency",
  label: "Resubscribe Frequency (in days)",
  isRequired: true,
  selectOptions: [
    { label: "30", value: "30" },
    { label: "90", value: "90" },
    { label: "180", value: "180" },
    { label: "365", value: "365" },
    { label: "Custom", value: "custom" },
  ],
  description: "Enter frequency.",
};

const subscriptionIdProps: InputFieldProps = {
  name: "subscriptionId",
  label: "Subscription Id",
  description: "SubscriptionId",
};

const credentialIdProps: InputFieldProps = {
  name: "credentialId",
  label: "Credential Id",
  description: "CredentialId",
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
  description:
    "Disable the trigger when it's not needed or should be temporarily turned off.",
};

export {
  idProps,
  nameProps,
  mailboxProps,
  folderProps,
  expiryDateTimeProps,
  resubscribeEnabledProps,
  resubscribeFrequencyProps,
  subscriptionIdProps,
  credentialIdProps,
  providerProps,
  isDisabledProps,
};
