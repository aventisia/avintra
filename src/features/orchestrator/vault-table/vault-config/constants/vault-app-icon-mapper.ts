import { VaultAppsEnum } from "../../enums/vault-apps-enum";

export const vaultAppIconMapper: Record<VaultAppsEnum, string> = {
  [VaultAppsEnum.OpenAI]: "/brand-img/openai.svg",
  [VaultAppsEnum.AWS]: "/brand-img/aws.svg",
  [VaultAppsEnum.Twilio]: "/brand-img/twilio.svg",
  [VaultAppsEnum.SendGrid]: "/brand-img/sendgrid.svg",
  [VaultAppsEnum.GitHub]: "/brand-img/github.svg",
  [VaultAppsEnum.M365Excel]: "/brand-img/m365.svg",
  [VaultAppsEnum.GeneralCredentials]: "/assets/CredentialManager.svg",
};
