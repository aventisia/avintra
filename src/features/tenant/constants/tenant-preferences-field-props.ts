import { InputFieldProps, SwitchFieldProps } from "@aventisia/ui/form";

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
const isSSOEnabledProps: SwitchFieldProps = {
  name: "isSSOEnabled",
  label: "Enable Single Sign-On (SSO)",
  description:
    "If enabled, users can log in using an external authentication provider",
};

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
  description:
    "If enabled, user sessions will automatically time out after a period of inactivity",
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
  isSSOEnabledProps,
  isTwoFAEnabledProps,
  isIdleSessionTimeoutEnabledProps,
  idleSessionTimeoutMinutesProps,
};
