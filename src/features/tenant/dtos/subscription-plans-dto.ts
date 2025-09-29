export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxCredits: number;
  maxPublishedItems: number;
  historyRetentionDays: number;
  maxSpaces: number;
  storageLimitMB: number;
  maxUsers: number;
  isDisabled: boolean;
  createdBy: string;
  createdOn: Date;
  lastModifiedBy: string;
  lastModifiedOn: Date;
}
