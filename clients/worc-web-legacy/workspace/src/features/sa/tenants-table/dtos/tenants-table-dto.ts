import { DatabaseOptionsEnum } from "@/react-toolkit/enums/database-options-enum";

import { CountriesEnum, CurrenciesEnum } from "@aventisia/ui/enums";

/**
 * Represents a data transfer object (DTO) for a tenant.
 */
export interface TenantsTableDto {
  id?: string;

  name: string;

  type: string;

  currency: CurrenciesEnum;

  effectiveDate: Date | string;

  renewalDate: Date | string;

  expiresOn?: Date | string;

  resourceType: string;

  isTwoFAEnabled?: boolean;
  isPwdEnabled?: boolean;
  isSSOEnabled?: boolean;
  ssoConfigJson?: string;

  isPwdNeverExpiresEnabled?: boolean;
  daysBeforePwdExpires?: number;

  isIdleSessionTimeoutEnabled?: boolean;
  idleSessionTimeoutMinutes?: number;

  dbOption?: DatabaseOptionsEnum;
  dbNamePrefix?: string;
  dbUserId?: string;
  dbPwd?: string;
  dbHost?: string;
  dbPort?: number;

  isDisabled?: boolean;

  createdBy?: string;
  createdOn?: Date | string;
  lastModifiedBy?: string;
  lastModifiedOn?: Date | string;

  domain: string;
  numberOfEmployees: number;
  industry?: string;
  country: CountriesEnum;
  role?: string;

  discount?: number; // range 0–10

  containerName: string;
  publishAgent: number;
  totalJobs:number;

  totalExecutionTime: number;
  consumedCredits: number;
  totalUsers: number;
  availableCredits: number;

  activePlan?: string;

  storageSize: number;
}
