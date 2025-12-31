import { CurrenciesEnum } from "@aventisia/ui/enums";

import { DatabaseOptionsEnum } from "@/react-toolkit/enums/database-options-enum";
import { DeploymentTypeEnum } from "@/react-toolkit/enums/deployment-types-enum";

/**
 * Represents a data transfer object (DTO) for a tenant.
 */
export interface TenantsTableDto {
  /**
   * Gets or sets the tenant record's primary key.
   *
   * Note: Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the unique full name of the tenant. Maximum length is 100 characters.
   */
  name: string;

  /**
   * Gets or sets the type of the tenant
   */
  type?: DeploymentTypeEnum;

  /**
   * Gets or sets the currency of the tenant
   */
  currency?: CurrenciesEnum;

  /**
   * Gets or sets the contract effective date and time of the tenant's account based on the subscription/trial period.
   */
  effectiveDate?: Date;

  /**
   * Gets or sets the contract renewal date and time of the tenant's account based on the subscription/trial period.
   */
  renewalDate?: Date;

  /**
   * Gets or sets the expiry date and time of the tenant's account based on the subscription/trial period.
   */
  expiresOn?: Date;

  /**
   * Gets or sets a flag indicating if two-factor authentication is enabled for tenant users. The default value is false.
   */
  isTwoFAEnabled?: boolean;

  /**
   * Gets or sets a flag indicating if login using password is enabled for tenant users. The default value is true.
   */
  isPwdEnabled?: boolean;

  /**
   * Gets or sets a flag indicating if single sign-on is enabled for tenant users. The default value is false.
   */
  isSSOEnabled?: boolean;

  /**
   * Gets or sets the single sign-on configuration of the tenant.
   */
  ssoConfigJson?: string;

  /**
   * Gets or sets a flag indicating if password expiry is enabled for tenant users. The default value is true.
   */
  isPwdNeverExpiresEnabled?: boolean;

  /**
   * Gets or sets the number of days before the tenant user's password expires (only applicable if IsPwdNeverExpiresEnabled is enabled). The default value is 30 days.
   */
  daysBeforePwdExpires?: number;

  /**
   * Gets or sets a flag indicating if automatic session logout due to inactivity is enabled for tenant users. The default value is true.
   */
  isIdleSessionTimeoutEnabled?: boolean;

  /**
   * Gets or sets the number of minutes after which a user's session will be logged out due to inactivity (only applicable if IsIdleSessionTimeoutEnabled is enabled). The default value is 15 minutes.
   */
  idleSessionTimeoutMinutes?: number;

  /**
   * Gets or sets the database options for the tenant: Shared, Isolated, or DedicatedServer. The default value is Shared.
   */
  dbOption?: DatabaseOptionsEnum;

  /**
   * Gets or sets the prefix for database names for the Isolated/DedicatedServer options. Maximum length is 10 characters.
   */
  dbNamePrefix?: string;

  /**
   * Gets or sets the database user ID required to login to the database. Maximum length is 50 characters.
   */
  dbUserId?: string;

  /**
   * Gets or sets the database password required to login to the database. Maximum length is 50 characters.
   */
  dbPwd?: string;

  /**
   * Gets or sets the IP address or URL of the database server where the database exists. Maximum length is 500 characters.
   */
  dbHost?: string;

  /**
   * Gets or sets the port of the database server.
   */
  dbPort?: number;

  /**
   * Gets or sets a flag indicating whether the tenant record is disabled.
   *
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the tenant record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the tenant record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the tenant record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the tenant record was last modified.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn?: Date;
}
