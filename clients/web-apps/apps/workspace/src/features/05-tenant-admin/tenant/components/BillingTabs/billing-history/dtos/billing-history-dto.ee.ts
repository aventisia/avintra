export interface BillingHistoryDTO {
  id?: string;
  name: string;
  paidOn: string;
  amount: string;
  paymentStatus: string;
  type: string;
  currency: string;
}
