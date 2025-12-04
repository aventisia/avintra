import { CreditServiceTypesEnum } from "./credit-service-type-enum";

// Map flow node names to service types
const nodeToServiceTypeMap: Record<string, CreditServiceTypesEnum> = {
  SendTextSmsActivity: CreditServiceTypesEnum.TwilioSms,
  SendWhatsappMessageActivity: CreditServiceTypesEnum.TwilioWhatsApp,
  SendWhatsAppMessageViaMessagingServiceActivity:
    CreditServiceTypesEnum.TwilioWhatsApp,
  SendEmailThroughSendGridActivity: CreditServiceTypesEnum.SendGridEmail,
};

// Fixed unit cost mapping per service type
const serviceTypeToUnitMap: Partial<Record<CreditServiceTypesEnum, number>> = {
  [CreditServiceTypesEnum.TwilioSms]: 1,
  [CreditServiceTypesEnum.TwilioWhatsApp]: 1,
  [CreditServiceTypesEnum.SendGridEmail]: 1,
};

export { nodeToServiceTypeMap, serviceTypeToUnitMap };
