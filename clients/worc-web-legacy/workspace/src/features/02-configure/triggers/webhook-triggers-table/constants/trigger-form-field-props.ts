import {
  DatePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";

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

const webhookUrlProps: InputFieldProps = {
  name: "webhookUrl",
  label: "Webhook Url",

  // description: "Webhook URL will be active after trigger creation",
  description: "Webhook URL is auto-generated after trigger creation",
};

const apiKeyProps: InputFieldProps = {
  name: "apiKey",
  label: "Api Key",
};

const apiKeyExpiryProps: DatePickerFieldProps = {
  name: "apiKeyExpiry",
  label: "Expiry Date",
  description: "The date when the trigger will expire.",
  isRequired: true,
};

const apiKeyExpiryDaysProps: SelectFieldProps = {
  name: "apiKeyExpiryDays",
  label: "API Key Expiry (in days)",
  isRequired: true,
  selectOptions: [
    { label: "30", value: "30" },
    { label: "90", value: "90" },
    { label: "180", value: "180" },
    { label: "365", value: "365" },
    { label: "Custom", value: "custom" },
  ],
};

const callbackUrlProps: InputFieldProps = {
  name: "callbackUrl",
  label: "Callback Url",
};

const expectedPayloadSchemaProps: InputFieldProps = {
  name: "expectedPayloadSchema",
  label: "Input Arguments Schema",
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
  webhookUrlProps,
  apiKeyProps,
  apiKeyExpiryDaysProps,
  apiKeyExpiryProps,
  callbackUrlProps,
  expectedPayloadSchemaProps,
  isDisabledProps,
};
