export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  frequency: string;
  currency: string;
  uniqueName: string;
  price: number;
  maxCredits: number;
  maxPublishedItems: number;
  historyRetentionDays: number;
  maxSpaces: number;
  storageLimitMB: number;
  maxUsers: number;
  isDisabled: boolean;
  createdBy: string;
  type: string;
  createdOn: Date | string;
  lastModifiedBy: string | null;
  lastModifiedOn: Date | string;
}
