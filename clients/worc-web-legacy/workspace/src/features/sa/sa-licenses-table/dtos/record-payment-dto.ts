/**
 * Represents a data transfer object (DTO) for a license.
 */
export interface RecordPaymentDto {
  Id: string;
  PlanId: string;
  AdditionalUnitsRequested: number;
  DateReceived: Date;
  AmountReceived: number;
  Variance: number;
  BalanceDue: number;
  WriteOffRemainingDues: boolean;
}
