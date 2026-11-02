import { CurrenciesEnum } from "@avplatform/ui/enums";
import { DatabaseOptionsEnum } from "@avplatform/ui/enums/database-options-enum";
import { DeploymentTypeEnum } from "@avplatform/ui/enums/deployment-types-enum";
import {
  type DateTimePickerFieldProps,
  InputFieldProps,
  RadioGroupFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

// Tenant Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Tenant ID",
  disabled: true,
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  description:
    "The tenant's name.\n\n- **Max length:** 100 characters.\n- **Allowed characters:** letters and numbers, with a single space between words.\n- **Can be changed** after creation.",
};

// Domain
export const domainProps: InputFieldProps = {
  name: "domain",
  label: "Domain",
  placeholder: "company.com",
  description:
    "The tenant's email domain, matched against the signed-in admin's email domain for single sign-on.\n\n- **Max length:** 100 characters.",
};

export const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  description: "The deployment type of the tenant.",
  selectOptions: enumToArray(DeploymentTypeEnum),
  isRequired: true,
};

export const currencyProps: SelectFieldProps = {
  name: "currency",
  label: "Currency",
  placeholder: "Currency",
  isRequired: true,
  description: "The tenant's currency.",
  selectOptions: enumToArray(CurrenciesEnum),
};

export const effectiveOnProps: DateTimePickerFieldProps = {
  name: "effectiveDate",
  label: "Contract effective date",
  isRequired: true,
  description: "When the contract takes effect.",
  granularity: "minute",
  hourCycle: 12,
};

// Expires On
export const renewsOnProps: DateTimePickerFieldProps = {
  name: "renewalDate",
  label: "Contract renewal date",
  isRequired: true,
  description: "When the contract renews.",
  granularity: "minute",
  hourCycle: 12,
};

// Is TwoFA Enabled
export const isTwoFAEnabledProps: SwitchFieldProps = {
  name: "isTwoFAEnabled",
  label: "Require two-factor authentication (2FA)",
  description:
    "If enabled, all users will need an additional verification step (e.g., one time password via email or code from an authenticator app) to log in, enhancing security",
};

// Is Change Request Enabled
export const isChangeRequestEnabledProps: SwitchFieldProps = {
  name: "isChangeRequestEnabled",
  label: "Enable change requests",
  description: "If enabled, tenant admins can create change request tickets",
};

// Is Password Enabled
export const isPwdEnabledProps: SwitchFieldProps = {
  name: "isPwdEnabled",
  label: "Enable password login",
  description: "If disabled, users cannot log in using their password",
};

// Is SSO Enabled
export const isSSOEnabledProps: SwitchFieldProps = {
  name: "isSSOEnabled",
  label: "Enable single sign-on (SSO)",
  description: "If enabled, users can log in using an external authentication provider",
};

// SSO Config JSON
export const ssoConfigJsonProps: TextareaFieldProps = {
  name: "ssoConfigJson",
  label: "Single sign-on (SSO) configuration",
  description:
    "Read-only. The single sign-on configuration is managed by the tenant admin and is hidden from the super admin view.",
  className: "min-h-[12.5rem]",
};

// Is Password Never Expires Enabled
export const isPwdNeverExpiresEnabledProps: SwitchFieldProps = {
  name: "isPwdNeverExpiresEnabled",
  label: "Passwords never expire",
  description: "Enabling this removes password expiration",
};

// Days Before Password Expires
export const daysBeforePwdExpiresProps: InputFieldProps = {
  name: "daysBeforePwdExpires",
  label: "Days before password expires",
  type: "number",
  description: "The number of days before passwords expire.",
};

// Is Idle Session Timeout Enabled
export const isIdleSessionTimeoutEnabledProps: SwitchFieldProps = {
  name: "isIdleSessionTimeoutEnabled",
  label: "Enable idle session timeout",
  description: "If enabled, user sessions will automatically time out after a period of inactivity",
};

// Idle Session Timeout Minutes
export const idleSessionTimeoutMinutesProps: InputFieldProps = {
  name: "idleSessionTimeoutMinutes",
  label: "Idle session timeout (in minutes)",
  type: "number",
  description: "The inactivity period in minutes before timeout.",
};

// Database Option
export const dbOptionProps: RadioGroupFieldProps = {
  name: "dbOption",
  label: "Database options:",
  selectOptions: [
    {
      value: DatabaseOptionsEnum.Shared,
      label: "Shared",
      description:
        "Tenants share a common database infrastructure. Suitable for low-resource tenants or those not requiring high isolation",
    },
    {
      value: DatabaseOptionsEnum.Isolated,
      label: "Isolated",
      description:
        "Tenants have their own database schema within a shared infrastructure. Offers a balance between cost and isolation.",
    },
    {
      value: DatabaseOptionsEnum.DedicatedServer,
      label: "Dedicated server (premium)",
      description:
        "Tenants have their own dedicated database server. Provides the highest performance and complete isolation, but comes at a higher cost.",
    },
  ],
};

// Database Name Prefix
export const dbNamePrefixProps: InputFieldProps = {
  name: "dbNamePrefix",
  label: "Database name prefix",
  description:
    "Add a specific prefix for your database. This option allows you to customize the schema name for better organization and identification",
};

// Database User Id
export const dbUserIdProps: InputFieldProps = {
  name: "dbUserId",
  label: "User ID",
  description: "Enter a username of the dedicated account to access the database.",
};

// Database Password
export const dbPwdProps: InputFieldProps = {
  name: "dbPwd",
  label: "Password",
  type: "password",
  description: "Enter a password of the dedicated account to access the database.",
};

// Database Host
export const dbHostProps: InputFieldProps = {
  name: "dbHost",
  label: "Host",
  description:
    "Enter the hostname or IP address of the dedicated database server. This is where the application will connect to the database",
};

// Database Port
export const dbPortProps: InputFieldProps = {
  name: "dbPort",
  label: "Port",
  type: "number",
  description:
    "Enter the port number on which the dedicated database server listens for connections. This is typically the default port for your chosen database management system (e.g., 5432 for PostgreSQL)",
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable record",
  description: "Disable this record if it's been outdated, or not required anymore",
};
