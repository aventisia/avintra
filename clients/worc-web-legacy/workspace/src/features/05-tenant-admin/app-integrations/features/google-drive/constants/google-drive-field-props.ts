import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";

const connectUsingProps: SelectFieldProps = {
  name: "connectUsing",
  label: "Connect Using",
  isRequired: true,
  className: "text-sm resize-none",
  selectOptions: [
    {
      label: "OAuth2 (recommended)",
      value: "OAuth2",
    },
    {
      label: "Service Account",
      value: "service_account",
    },
  ],
};

// OAuth Props
const oAuthRedirectURLProps: InputFieldProps = {
  name: "oAuthRedirectURL",
  label: "OAuth Redirect URL",
  disabled: true,
  readOnly: true,
  className: "text-sm resize-none",
};

const clientIdProps: InputFieldProps = {
  name: "clientId",
  label: "Client ID",
  isRequired: true,
  className: "text-sm resize-none",
};

const clientSecretProps: InputFieldProps = {
  name: "clientSecret",
  label: "Client Secret",
  type: "password",
  isRequired: true,
  className: "text-sm resize-none",
};

// Service account props
const regionProps: InputFieldProps = {
  name: "region",
  label: "Region",
  isRequired: true,
  className: "text-sm resize-none",
};

const serviceAccountEmailProps: InputFieldProps = {
  name: "serviceAccountEmail",
  label: "Service Account Email",
  isRequired: true,
  className: "text-sm resize-none",
};

const privateKeyProps: InputFieldProps = {
  name: "privateKey",
  label: "Private Key",
  type: "password",
  isRequired: true,
  className: "text-sm resize-none",
};

const impersonateUserProps: SwitchFieldProps = {
  name: "impersonateUser",
  label: "Impersonate a User",
  description: "",
  className: "text-sm resize-none",
};

const emailProps: InputFieldProps = {
  name: "email",
  label: "Email",
  className: "text-sm resize-none",
  isRequired: true,
};

const httpRequestNodeProps: SwitchFieldProps = {
  name: "httpRequestNode",
  label: "HTTP Request Node",
  description: "",
  className: "text-sm resize-none",
};

const scopesProps: InputFieldProps = {
  name: "scopes",
  label: "Scope(s)",
  isRequired: true,
  className: "text-sm resize-none",
};

export {
  connectUsingProps,
  oAuthRedirectURLProps,
  clientIdProps,
  clientSecretProps,
  regionProps,
  serviceAccountEmailProps,
  privateKeyProps,
  impersonateUserProps,
  emailProps,
  httpRequestNodeProps,
  scopesProps,
};
