import { InputFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

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

const webhookUrlProps: InputFieldProps = {
  name: "webhookUrl",
  label: "Webhook Url",

  // description: "Webhook URL will be active after trigger creation",
  description: "Webhook URL is auto-generated after trigger creation",
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
  description: "Disable the trigger when it's not needed or should be temporarily turned off.",
};

export {
  idProps,
  nameProps,
  webhookUrlProps,
  callbackUrlProps,
  expectedPayloadSchemaProps,
  isDisabledProps,
};
