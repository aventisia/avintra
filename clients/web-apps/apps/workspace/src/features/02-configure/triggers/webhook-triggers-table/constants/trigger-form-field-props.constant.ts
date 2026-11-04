import { InputFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Unique name",
  placeholder: "e.g. Order created hook",
  isRequired: true,
  description:
    "Specify a **unique** name for this trigger.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Cannot be changed** after creation.",
};

const webhookUrlProps: InputFieldProps = {
  name: "webhookUrl",
  label: "Webhook URL",
  description: "Generated when the trigger is created. Send requests here to run the agent.",
};

const callbackUrlProps: InputFieldProps = {
  name: "callbackUrl",
  label: "Callback URL",
  placeholder: "e.g. https://example.com/callback",
  description: "Optional URL called after the agent finishes.",
};

const inputSchemaLabelProps = {
  label: "Input arguments schema",
  description: "JSON schema the webhook payload should conform to.",
};

const agentLabelProps = {
  label: "Agent",
  description: "Agent to run when the webhook is called.",
  isRequired: true,
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable trigger",
  description: "Turn it off when it’s not needed or should be paused.",
};

export {
  agentLabelProps,
  callbackUrlProps,
  inputSchemaLabelProps,
  isDisabledProps,
  nameProps,
  webhookUrlProps,
};
