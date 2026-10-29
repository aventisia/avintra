import {
  type DateTimePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { EmailTriggerProviderEnum } from "../enums/trigger-frequency-provider-enum";
import { teamsMessageResourceOptions } from "./form-utils";

// trigger Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Trigger ID",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Unique name",
  isRequired: true,
  description:
    "Specify a **unique** name for this trigger.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Cannot be changed** after creation.",
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
  description: "The message resource to watch (e.g. Teams).",
  selectOptions: teamsMessageResourceOptions,
};

const expiryDateTimeProps: DateTimePickerFieldProps = {
  name: "expiryDateTime",
  label: "Expiry date & time",
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
  label: "Subscription period (in minutes)",
  isRequired: true,
  description:
    "Enter the subscription duration in minutes (1-4320). Microsoft 365 subscriptions expire after a maximum of 3 days.",
};

const subscriptionIdProps: InputFieldProps = {
  name: "subscriptionId",
  label: "Subscription ID",
  description: "The subscription identifier (optional).",
};

const credentialNameProps: InputFieldProps = {
  name: "credentialName",
  label: "Credential name",
  description: "CredentialName",
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
  label: "Disable trigger",
  description: "Disable the trigger when it's not needed or should be temporarily turned off.",
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
  credentialNameProps,
  providerProps,
  isDisabledProps,
};
