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
const referenceProps: InputFieldProps = {
  name: "reference",
  label: "Resource ID(s)",
  isRequired: true,
  description:
    "Enter required ID(s) based on the selected resource. For multiple IDs, use '/' in the same order as in the resource path.\nExample: team-id/channel-id",
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

const resubscribeFrequencyProps: InputFieldProps = {
  name: "resubscribeFrequency",
  label: "Subscription Period (in minutes)",
  isRequired: true,
  description:
    "Enter the subscription duration in minutes (0-4320). Microsoft 365 subscriptions expire after a maximum of 3 days.",
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
  referenceProps,
  resourceProps,
  expiryDateTimeProps,
  resubscribeEnabledProps,
  resubscribeFrequencyProps,
  subscriptionIdProps,
  credentialIdProps,
  providerProps,
  isDisabledProps,
};
