import {
  DatePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { EmailTriggerProviderEnum } from "../enums/trigger-frequency-provider-enum";
import { teamsMessageResourceOptions } from "./form-utils";

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
  label: "Id",
  isRequired: true,
  description: "Resource related Id",
};

const resourceProps: SelectFieldProps = {
  name: "resource",
  label: "Resource",
  description: "Resource",
  selectOptions: teamsMessageResourceOptions,
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
    "Enable to maintain continuous connectivity and prevent subscription expiry.",
  defaultChecked: false,
};

const resubscribeFrequencyProps: SelectFieldProps = {
  name: "resubscribeFrequency",
  label: "Subscription Period (in days)",
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
  description: "Message provider.",
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
  resourceProps,
  expiryDateTimeProps,
  resubscribeEnabledProps,
  resubscribeFrequencyProps,
  subscriptionIdProps,
  credentialIdProps,
  providerProps,
  isDisabledProps,
};
