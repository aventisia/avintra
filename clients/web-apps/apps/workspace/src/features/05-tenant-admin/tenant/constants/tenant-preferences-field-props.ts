import { InputFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

// Is Password Enabled (Login)
const isPwdEnabledProps: SwitchFieldProps = {
  name: "isPwdEnabled",
  label: "Enable Password Login",
  description: "If disabled, users cannot log in using their password",
};

// Is Password Never Expires
const isPwdNeverExpiresEnabledProps: SwitchFieldProps = {
  name: "isPwdNeverExpiresEnabled",
  label: "Password Never Expires",
  description: "Enabling this removes password expiration",
};

// Is SSO Enabled
const ssoToggleLabel = "Enable SSO";
const ssoEnabledTooltip = "Single sign-on is enabled. Click to disable.";
const ssoDisabledTooltip = "Single sign-on is disabled. Click to enable.";
const ssoEnableConfirmTitle = "Enable single sign-on?";
const ssoEnableConfirmDescription =
  "Users in your organization will be able to sign in with Microsoft Entra ID.";
const ssoEnableConfirmBtnText = "Yes, enable";
const ssoDisableConfirmTitle = "Disable single sign-on?";
const ssoDisableConfirmDescription =
  "Users will no longer be able to sign in with Microsoft Entra ID. Users without a password will be unable to sign in until they set one using Forgot password.";
const ssoDisableConfirmBtnText = "Yes, disable";
const ssoEnabledSuccessMessage = "Single sign-on enabled successfully.";
const ssoDisabledSuccessMessage = "Single sign-on disabled successfully.";
const ssoUpdateErrorMessage = "Single sign-on was not updated. Please try again.";
const ssoStatusConnectedLabel = "Connected";
const ssoProviderInfoTooltip = "Single sign-on provider for your organization";
const ssoEmailDomainLabel = "Email domain";
const ssoDisableWarningTitle = "Single sign-on is disabled";

const ssoConnectRequiredHint = "Connect the identity provider before enabling single sign-on.";

const ssoAdminOnlyNotice = "Only a tenant administrator can change single sign-on settings.";

const ssoConnectLabel = "Connect";
const ssoReconnectLabel = "Reconnect";

// Is Two-Factor Authentication Enabled (2FA)
const isTwoFAEnabledProps: SwitchFieldProps = {
  name: "isTwoFAEnabled",
  label: "Required Two Factor Authentication (2FA)",
  description:
    "If enabled, all users will need an additional verification step (e.g., one-time password via email or code from an authenticator app) to log in, enhancing security",
};

// Is Idle Session Timeout Enabled
const isIdleSessionTimeoutEnabledProps: SwitchFieldProps = {
  name: "isIdleSessionTimeoutEnabled",
  label: "Enable Idle Session Timeout",
  description: "If enabled, user sessions will automatically time out after a period of inactivity",
};

// Idle Session Timeout Minutes
const idleSessionTimeoutMinutesProps: InputFieldProps = {
  name: "idleSessionTimeoutMinutes",
  label: "Idle Session Timeout (in Minutes)",
  type: "number",
};

// Password Expiry Days
const daysBeforePwdExpiresProps: InputFieldProps = {
  name: "daysBeforePwdExpires",
  label: "Days Before Password Expires",
  type: "number",
};

export {
  isPwdEnabledProps,
  isPwdNeverExpiresEnabledProps,
  daysBeforePwdExpiresProps,
  ssoToggleLabel,
  ssoEnabledTooltip,
  ssoDisabledTooltip,
  ssoEnableConfirmTitle,
  ssoEnableConfirmDescription,
  ssoEnableConfirmBtnText,
  ssoDisableConfirmTitle,
  ssoDisableConfirmDescription,
  ssoDisableConfirmBtnText,
  ssoEnabledSuccessMessage,
  ssoDisabledSuccessMessage,
  ssoUpdateErrorMessage,
  ssoStatusConnectedLabel,
  ssoProviderInfoTooltip,
  ssoEmailDomainLabel,
  ssoDisableWarningTitle,
  ssoConnectRequiredHint,
  ssoAdminOnlyNotice,
  ssoConnectLabel,
  ssoReconnectLabel,
  isTwoFAEnabledProps,
  isIdleSessionTimeoutEnabledProps,
  idleSessionTimeoutMinutesProps,
};
